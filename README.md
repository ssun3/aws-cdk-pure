# aws-cdk-pure

Purely Functional Cloud Components with AWS CDK


## Inspiration

The library is an extension to AWS CDK which is inspired by [Composable Cloud Components with AWS CDK](https://i.am.fog.fish/2019/07/28/composable-cloud-components-with-aws-cdk.html) and [Purely Functional Cloud Components with AWS CDK](https://i.am.fog.fish/2019/08/23/purely-functional-cloud-with-aws-cdk.html).


## Getting started

The latest version of the bot is available at its `master` branch. All development, including new features and bug fixes, take place on the `master` branch using forking and pull requests as described in contribution guidelines. The latest package release is available at npm

```bash
npm install --save aws-cdk-pure
```

## Key features 

AWS development kit do not implement a pure functional approach. The abstraction of cloud resources is exposed using class hierarchy, each type represents a "cloud component" and encapsulates everything AWS CloudFormation needs to create the component. A shift from category of classes to category of pure functions simplifies the development by **scraping boilerplate**. A pure function component of type `IaaC<T>` is a right approach to express semantic of Infrastructure as a Code.

You cloud code will looks like these with this library. Please check the details about key features [here](https://i.am.fog.fish/2019/08/23/purely-functional-cloud-with-aws-cdk.html).

```typescript
import { IaaC, root, join, flat, use, iaac, wrap } from 'aws-cdk-pure'

namespace cloud {
  export const lambda  = iaac(Function)
  export const gateway = iaac(RestApi)
  export const resource = wrap(LambdaIntegration)
}

function WebHook(parent: cdk.Construct): lambda.FunctionProps {
  return {
    runtime: lambda.Runtime.NODEJS_10_X,
    code: new lambda.AssetCode(...),
    ...
  }
}

function Gateway(): api.RestApiProps {
  return {
    endpointTypes: [api.EndpointType.REGIONAL],
    ...
  }
}

function RestApi(): IaaC<api.RestApi> {
  const restapi = cloud.gateway(Gateway)
  const webhook = cloud.resource(cloud.lambda(WebHook))
  
  return use({ restapi, webhook })
    .effect(
      x => x.restapi.root.addResource('webhook').addMethod('POST', x.webhook)
    )
    .yield('restapi')
}

function CodeBuildBot(stack: cdk.Construct): cdk.Construct {
  join(stack, flat(RestApi))
  return stack
}

const app = new cdk.App()
root(app, CodeBuildBot)
app.synth()
```

See full example in [demo project](https://github.com/fogfish/code-build-bot).

## License

[![See LICENSE](https://img.shields.io/github/license/fogfish/aws-cdk-pure.svg?style=for-the-badge)](LICENSE)
