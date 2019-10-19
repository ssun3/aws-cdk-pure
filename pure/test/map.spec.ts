import { expect } from 'chai'
import * as pure from '../src/index'
import * as cdk from '@aws-cdk/core'

const cf = pure.iaac(cdk.CfnResource)

function MyA(): cdk.CfnResourceProps {
  return { type: 'A' }
}

function MyB(): cdk.CfnResourceProps {
  return { type: 'B' }
}

function MyC(): pure.IaaC<cdk.CfnResource> {
  return cf(MyA)
    .flatMap(a => 
      cf(MyB).effect(b => b.addOverride('Other', a.logicalId))
    )
}

function MyD(scope: cdk.Construct): pure.IaaC<cdk.CfnResource> {
  return cf(MyA)
    .map(_ => new cdk.CfnResource(scope, 'MyD', { type: 'D' }))
}

function Stack(scope: cdk.Construct): cdk.Construct {
  pure.join(scope, MyC)
  return scope
}

it('apply flatMap to pure functional component',
  () => {
    const app = new cdk.App()
    pure.root(app, Stack, 'IaaC')
    const response = app.synth()
    const stack = response.getStack('IaaC')
    expect(stack.template).deep.equal(
      {
        Resources: { 
          MyA: { Type: 'A' },
          MyB: { Type: 'B', Other: 'MyA' },
        }
      }
    )
  }
)

it('apply map to pure functional component',
  () => {
    const app = new cdk.App()
    const Stack = (): cdk.StackProps => ({ env: {} })
    pure.join(app,
      pure.iaac(cdk.Stack)(Stack).effect(x => pure.join(x, MyD))
    )
    const response = app.synth()
    const stack = response.getStack('Stack')
    expect(stack.template).deep.equal(
      {
        Resources: { 
          MyA: { Type: 'A' },
          MyD: { Type: 'D' },
        }
      }
    )
  }
)