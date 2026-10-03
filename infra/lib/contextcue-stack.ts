import path from "node:path";
import { fileURLToPath } from "node:url";
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { CorsHttpMethod, HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

const here = path.dirname(fileURLToPath(import.meta.url));

export class ContextCueStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const media = new Bucket(this, "Media", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true
    });

    const playback = new Table(this, "Playback", {
      tableName: "ContextCuePlayback",
      partitionKey: { name: "profileId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    const preferences = new Table(this, "Preferences", {
      tableName: "ContextCuePreferences",
      partitionKey: { name: "profileId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const repoRoot = path.join(here, "../..");
    const apiFn = new NodejsFunction(this, "Api", {
      entry: path.join(repoRoot, "src/lambda.ts"),
      projectRoot: repoRoot,
      depsLockFilePath: path.join(repoRoot, "package-lock.json"),
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      memorySize: 512,
      timeout: Duration.seconds(20),
      environment: {
        PLAYBACK_TABLE: playback.tableName,
        PREFERENCES_TABLE: preferences.tableName,
        MEDIA_BUCKET: media.bucketName
      },
      bundling: {
        minify: true,
        sourceMap: false,
        externalModules: ["@aws-sdk/*"]
      }
    });
    playback.grantReadWriteData(apiFn);
    preferences.grantReadWriteData(apiFn);
    media.grantReadWrite(apiFn);
    apiFn.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["bedrock:InvokeModel", "bedrock:Converse"],
      resources: ["*"]
    }));

    const http = new HttpApi(this, "Http", {
      apiName: "contextcue",
      corsPreflight: {
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.PUT, CorsHttpMethod.POST],
        allowOrigins: ["*"],
        allowHeaders: ["content-type"]
      }
    });
    const integration = new HttpLambdaIntegration("ApiIntegration", apiFn);
    http.addRoutes({ path: "/health", methods: [HttpMethod.GET], integration });
    http.addRoutes({ path: "/v1/context", methods: [HttpMethod.POST], integration });
    http.addRoutes({ path: "/v1/playback", methods: [HttpMethod.GET, HttpMethod.PUT], integration });
    http.addRoutes({ path: "/v1/preferences", methods: [HttpMethod.GET, HttpMethod.PUT], integration });

    new CfnOutput(this, "ApiUrl", { value: http.apiEndpoint });
    new CfnOutput(this, "MediaBucket", { value: media.bucketName });
  }
}
