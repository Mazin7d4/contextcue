package com.contextcue.firetv

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import org.json.JSONObject
import java.io.BufferedReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import kotlin.math.max

class MainActivity : AppCompatActivity() {
    private val io = Executors.newSingleThreadExecutor()
    private val main = Handler(Looper.getMainLooper())
    private lateinit var player: ExoPlayer
    private lateinit var overlay: View
    private lateinit var cardTitle: TextView
    private lateinit var cardBody: TextView
    private lateinit var cardActions: LinearLayout
    private lateinit var status: TextView
    private lateinit var cues: List<Cue>
    private var textScale = "default"
    private var spoilerMode = "helpful"
    private var lastOperation = "recap"
    private var overlayOpen = false
    private var openingSeekDone = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        overlay = findViewById(R.id.overlay)
        cardTitle = findViewById(R.id.card_title)
        cardBody = findViewById(R.id.card_body)
        cardActions = findViewById(R.id.card_actions)
        status = findViewById(R.id.status)
        cues = loadCues()

        player = ExoPlayer.Builder(this).build()
        findViewById<PlayerView>(R.id.player).player = player
        player.setMediaItem(MediaItem.fromUri("android.resource://$packageName/${R.raw.lantern_shift}"))
        player.prepare()
        player.playWhenReady = true
        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                if (!openingSeekDone && state == Player.STATE_READY) {
                    openingSeekDone = true
                    player.seekTo(36_000)
                }
            }
        })

        bind(R.id.missed, "recap")
        bind(R.id.who, "identify_character")
        bind(R.id.line, "explain_dialogue")
        bind(R.id.why, "why_it_matters")
        findViewById<Button>(R.id.dial).setOnClickListener { showDial() }
        findViewById<Button>(R.id.missed).requestFocus()
        main.post(syncPlayback)
        main.post(pollPreferences)
    }

    private fun bind(id: Int, operation: String) {
        findViewById<Button>(id).setOnClickListener {
            lastOperation = operation
            requestContext(operation)
        }
    }

    private val syncPlayback = object : Runnable {
        override fun run() {
            if (::player.isInitialized) publishPlayback()
            main.postDelayed(this, 2000)
        }
    }

    private val pollPreferences = object : Runnable {
        override fun run() {
            io.execute {
                val prefs = getJson("/v1/preferences?profileId=demo-viewer")
                val mode = prefs?.optJSONObject("preferences")?.optString("spoilerMode").orEmpty()
                val scale = prefs?.optJSONObject("preferences")?.optString("textScale").orEmpty()
                main.post {
                    if (mode.isNotBlank()) spoilerMode = mode
                    if (scale.isNotBlank()) textScale = scale
                    applyScale()
                    status.text = "The Lantern Shift  ·  ${format(player.currentPosition)}  ·  ${label(spoilerMode)}"
                }
            }
            main.postDelayed(this, 3000)
        }
    }

    private fun requestContext(operation: String) {
        showCard("ONE MOMENT", "Looking only at what you've already seen.", retry = null)
        val position = player.currentPosition
        val cue = cueAt(position)
        io.execute {
            val body = JSONObject()
                .put("profileId", "demo-viewer")
                .put("mediaId", "lantern-shift")
                .put("playbackTimeMs", position)
                .put("operation", operation)
                .put("dialogueText", cue)
            val response = sendJson("POST", "/v1/context", body)
            main.post {
                if (response == null) {
                    showCard("COULDN'T LOAD CONTEXT", "Playback is still going.", operation)
                } else {
                    showCard(response.optString("title"), response.optString("text"), null)
                }
            }
        }
    }

    private fun showDial() {
        cardActions.removeAllViews()
        cardTitle.text = "SPOILER DIAL"
        cardBody.text = "All three modes stop at this moment in the story."
        listOf("strict" to "Strict — facts only", "helpful" to "Helpful — safe inference", "catch_me_up" to "Catch Me Up").forEach { (mode, label) ->
            cardActions.addView(actionButton(label) {
                io.execute {
                    sendJson("PUT", "/v1/preferences", JSONObject().put("profileId", "demo-viewer").put("spoilerMode", mode))
                    main.post {
                        spoilerMode = mode
                        hideOverlay()
                    }
                }
            })
        }
        overlay.visibility = View.VISIBLE
        overlayOpen = true
        cardActions.getChildAt(0)?.requestFocus()
    }

    private fun showCard(title: String, body: String, retry: String?) {
        cardActions.removeAllViews()
        cardTitle.text = title
        cardBody.text = body
        if (retry != null) cardActions.addView(actionButton("Try again") { requestContext(retry) })
        cardActions.addView(actionButton("Back") { hideOverlay() })
        overlay.visibility = View.VISIBLE
        overlayOpen = true
        cardActions.getChildAt(0)?.requestFocus()
        applyScale()
    }

    private fun hideOverlay() {
        overlay.visibility = View.GONE
        overlayOpen = false
        findViewById<Button>(R.id.missed).requestFocus()
    }

    private fun actionButton(label: String, click: () -> Unit): Button {
        return Button(this).apply {
            text = label
            setBackgroundResource(R.drawable.action_bg)
            setTextColor(getColorStateList(R.color.button_text))
            isFocusable = true
            textSize = 18f
            setOnClickListener { click() }
            val params = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(64))
            params.marginEnd = dp(12)
            layoutParams = params
            setPadding(dp(22), 0, dp(22), 0)
        }
    }

    private fun applyScale() {
        cardBody.textSize = if (textScale == "large") 32f else 24f
    }

    private fun publishPlayback() {
        val position = max(0, player.currentPosition)
        val body = JSONObject()
            .put("profileId", "demo-viewer")
            .put("mediaId", "lantern-shift")
            .put("positionMs", position)
            .put("currentCueText", cueAt(position))
        io.execute { sendJson("PUT", "/v1/playback", body) }
    }

    private fun cueAt(position: Long): String {
        return cues.firstOrNull { position in it.start..it.end }?.text ?: ""
    }

    private fun loadCues(): List<Cue> {
        val raw = assets.open("captions.vtt").bufferedReader().use(BufferedReader::readText)
        val cues = mutableListOf<Cue>()
        val pattern = Regex("""(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})""")
        val lines = raw.lines()
        var index = 0
        while (index < lines.size) {
            val match = pattern.find(lines[index])
            if (match == null) {
                index += 1
                continue
            }
            val start = stamp(match.groupValues)
            val end = stamp(match.groupValues.drop(4))
            index += 1
            val text = mutableListOf<String>()
            while (index < lines.size && lines[index].isNotBlank()) {
                text += lines[index].trim()
                index += 1
            }
            val spoken = text.joinToString(" ").substringAfter(": ").ifBlank { text.joinToString(" ") }
            cues += Cue(start, end, spoken)
        }
        return cues
    }

    private fun getJson(path: String): JSONObject? {
        return try {
            val connection = open(path, "GET")
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            JSONObject(stream.bufferedReader().readText())
        } catch (_: Exception) {
            null
        }
    }

    private fun sendJson(method: String, path: String, body: JSONObject): JSONObject? {
        return try {
            val connection = open(path, method)
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.outputStream.use { it.write(body.toString().toByteArray()) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            JSONObject(stream.bufferedReader().readText())
        } catch (_: Exception) {
            null
        }
    }

    private fun open(path: String, method: String): HttpURLConnection {
        val connection = URL(BuildConfig.API_BASE + path).openConnection() as HttpURLConnection
        connection.requestMethod = method
        connection.connectTimeout = 4000
        connection.readTimeout = 8000
        return connection
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && overlayOpen) {
            hideOverlay()
            return true
        }
        if (keyCode == KeyEvent.KEYCODE_MEDIA_REWIND || keyCode == KeyEvent.KEYCODE_DPAD_LEFT && event.isAltPressed) {
            player.seekTo(max(0, player.currentPosition - 10_000))
            return true
        }
        if (keyCode == KeyEvent.KEYCODE_MEDIA_FAST_FORWARD) {
            player.seekTo(player.currentPosition + 10_000)
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onStop() {
        player.pause()
        super.onStop()
    }

    override fun onDestroy() {
        main.removeCallbacksAndMessages(null)
        player.release()
        io.shutdownNow()
        super.onDestroy()
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private fun label(mode: String): String = when (mode) {
        "strict" -> "Strict"
        "catch_me_up" -> "Catch Me Up"
        else -> "Helpful"
    }

    private fun format(ms: Long): String {
        val total = ms / 1000
        return "%d:%02d".format(total / 60, total % 60)
    }

    private fun stamp(groups: List<String>): Long {
        return groups[1].toLong() * 3_600_000 + groups[2].toLong() * 60_000 + groups[3].toLong() * 1_000 + groups[4].toLong()
    }
}

private data class Cue(val start: Long, val end: Long, val text: String)
