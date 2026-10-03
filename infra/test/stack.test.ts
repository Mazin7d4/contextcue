import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { ContextCueStack } from "../lib/contextcue-stack.js";

describe("ContextCue stack", () => {
  it("creates the media bucket, state tables, and HTTP API", () => {
    const app = new App();
    const stack = new ContextCueStack(app, "Test", { env: { account: "293653898909", region: "us-west-2" } });
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::S3::Bucket", 1);
    template.resourceCountIs("AWS::DynamoDB::Table", 2);
    template.resourceCountIs("AWS::Lambda::Function", 2);
    template.resourceCountIs("AWS::ApiGatewayV2::Api", 1);
    expect(template.findResources("AWS::DynamoDB::Table")).toBeTruthy();
  });
});
