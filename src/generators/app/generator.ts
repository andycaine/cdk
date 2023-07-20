import {
  addProjectConfiguration,
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  Tree,
  writeJsonFile,
} from '@nx/devkit';
import * as path from 'path';
import { AppGeneratorSchema } from './schema';

export async function appGenerator(tree: Tree, options: AppGeneratorSchema) {
  const projectRoot = `packages/${options.name}`;
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'application',
    sourceRoot: `${projectRoot}/src`,
    targets: {
      build: {
        executor: '@nx/esbuild:esbuild',
        outputs: ['{options.outputPath}'],
        options: {
          platform: 'node',
          outputPath: `dist/${projectRoot}`,
          format: ['cjs'],
          bundle: false,
          main: `${projectRoot}/src/main.ts`,
          tsConfig: `${projectRoot}/tsconfig.json`,
          esbuildOptions: {
            sourcemap: false,
            outExtension: { '.js': '.js' },
          },
        },
      },
      deploy: {
        executor: 'nx:run-commands',
        options: {
          command: 'cdk deploy --require-approval never',
        },
        dependsOn: [{projects: ['self'], target: 'build'}]
      }
    },
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);

  writeJsonFile('cdk.json', {
    "app": `dist/packages/${options.name}/main.js`,
    "context": {
      "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
      "@aws-cdk/core:checkSecretUsage": true,
      "@aws-cdk/core:target-partitions": [
        "aws",
        "aws-cn"
      ],
      "@aws-cdk-containers/ecs-service-extensions:enableDefaultLogDriver": true,
      "@aws-cdk/aws-ec2:uniqueImdsv2TemplateName": true,
      "@aws-cdk/aws-ecs:arnFormatIncludesClusterName": true,
      "@aws-cdk/aws-iam:minimizePolicies": true,
      "@aws-cdk/core:validateSnapshotRemovalPolicy": true,
      "@aws-cdk/aws-codepipeline:crossAccountKeyAliasStackSafeResourceName": true,
      "@aws-cdk/aws-s3:createDefaultLoggingPolicy": true,
      "@aws-cdk/aws-sns-subscriptions:restrictSqsDescryption": true,
      "@aws-cdk/aws-apigateway:disableCloudWatchRole": true,
      "@aws-cdk/core:enablePartitionLiterals": true,
      "@aws-cdk/aws-events:eventsTargetQueueSameAccount": true,
      "@aws-cdk/aws-iam:standardizedServicePrincipals": true,
      "@aws-cdk/aws-ecs:disableExplicitDeploymentControllerForCircuitBreaker": true,
      "@aws-cdk/aws-iam:importedRoleStackSafeDefaultPolicyName": true,
      "@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy": true,
      "@aws-cdk/aws-route53-patters:useCertificate": true,
      "@aws-cdk/customresources:installLatestAwsSdkDefault": false,
      "@aws-cdk/aws-rds:databaseProxyUniqueResourceName": true,
      "@aws-cdk/aws-codedeploy:removeAlarmsFromDeploymentGroup": true,
      "@aws-cdk/aws-apigateway:authorizerChangeDeploymentLogicalId": true,
      "@aws-cdk/aws-ec2:launchTemplateDefaultUserData": true,
      "@aws-cdk/aws-secretsmanager:useAttachedSecretResourcePolicyForSecretTargetAttachments": true,
      "@aws-cdk/aws-redshift:columnId": true,
      "@aws-cdk/aws-stepfunctions-tasks:enableEmrServicePolicyV2": true,
      "@aws-cdk/aws-ec2:restrictDefaultSecurityGroup": true,
      "@aws-cdk/aws-apigateway:requestValidatorUniqueId": true,
      "@aws-cdk/aws-kms:aliasNameRef": true,
      "@aws-cdk/core:includePrefixInUniqueNameGeneration": true
    }
  });

  return addDependenciesToPackageJson(tree, {
    'aws-cdk-lib': 'latest',
    'constructs': 'latest',
  }, {
    '@nx/esbuild': 'latest',
    'esbuild': 'latest',
    'aws-cdk': 'latest',
  });
}

export default appGenerator;
