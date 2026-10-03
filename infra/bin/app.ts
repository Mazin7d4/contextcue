#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { ContextCueStack } from "../lib/contextcue-stack.js";

const app = new App();
new ContextCueStack(app, "ContextCueStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID || "293653898909",
    region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || "us-west-2"
  }
});
