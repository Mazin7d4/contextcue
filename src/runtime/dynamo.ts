import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { PlaybackState, ViewerPreferences } from "../domain/types.js";
import { defaultPreferences, type StateStore } from "./store.js";

export type DynamoTables = {
  playbackTable: string;
  preferencesTable: string;
  region: string;
};

/** Real DynamoDB state store. Used when STORE=dynamo. */
export class DynamoStateStore implements StateStore {
  private readonly doc: DynamoDBDocumentClient;

  constructor(private readonly tables: DynamoTables) {
    this.doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: tables.region }));
  }

  async getPlayback(profileId: string): Promise<PlaybackState | null> {
    const result = await this.doc.send(
      new GetCommand({ TableName: this.tables.playbackTable, Key: { profileId } })
    );
    return (result.Item as PlaybackState | undefined) ?? null;
  }

  async putPlayback(state: PlaybackState): Promise<void> {
    await this.doc.send(new PutCommand({ TableName: this.tables.playbackTable, Item: state }));
  }

  async getPreferences(profileId: string): Promise<ViewerPreferences> {
    const result = await this.doc.send(
      new GetCommand({ TableName: this.tables.preferencesTable, Key: { profileId } })
    );
    return (result.Item as ViewerPreferences | undefined) ?? defaultPreferences(profileId);
  }

  async putPreferences(preferences: ViewerPreferences): Promise<ViewerPreferences> {
    const next = { ...defaultPreferences(preferences.profileId), ...preferences };
    await this.doc.send(new PutCommand({ TableName: this.tables.preferencesTable, Item: next }));
    return next;
  }
}
