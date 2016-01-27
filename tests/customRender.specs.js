import React, { Component } from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectJSX from 'expect-jsx'

import { customRender, createPropAssignmentMap } from '../src/PropExtender'

expect.extend(expectJSX)

function Substitution(props) {
  return (
    <span>
      {props.text}
    </span>
  )
}

class TestComponent extends Component {
  handleClick(e){
    console.log('Clicked!')
  }

  render() {
    return (
      <div>
        { customRender(
          <button component={this.props.buttonComponent} onClick={this.handleClick.bind(this)} />
        )}
      </div>
    )
  }
}

describe('customRender', () => {
  it('should be a function', () => {
    expect(typeof customRender).toBe('function')
  })

  it('should not affect rendering if no props are passed', () => {
    const noSwap = customRender( <h1>Hello World</h1> )

    expect( noSwap ).toEqualJSX(<h1>Hello World</h1>)
  })

  it('should use an elements own props to swap render', () => {
    const swap = customRender( <h1 component="h2">Hello World</h1>)

    expect( swap ).toEqualJSX(<h2>Hello World</h2>)
  })

  it('should use mergeProps to swap render', () => {
    const swap = customRender( <h1>Hello World</h1>, {
      customProps: {
        component: 'h3'
      }
    })

    expect( swap ).toEqualJSX(<h3>Hello World</h3>)
  })

  it('should render composite components', () => {
    const swap = customRender( <h1 component={TestComponent}>Hello World</h1>)

    expect( swap ).toEqualJSX(<TestComponent>Hello World</TestComponent>)
  })

  it('should accept an element', () => {
    const swap = customRender( <h1 component={<TestComponent />}>Hello World</h1>)

    expect( swap ).toEqualJSX(<TestComponent>Hello World</TestComponent>)
  })

  it('should copy over an elements props', () => {
    const swap = customRender( <h1 text="Hello World" component={Substitution} />)

    const renderer = TestUtils.createRenderer()
    renderer.render(swap)
    const output = renderer.getRenderOutput()

    expect( output ).toEqualJSX(<span>Hello World</span>)
  })

  it('should allow passing in no element, and accept just props as second arg', () => {
    const swap = customRender( null, { component: Substitution, text: "Hello World" })

    const renderer = TestUtils.createRenderer()
    renderer.render(swap)
    const output = renderer.getRenderOutput()

    expect( output ).toEqualJSX(<span>Hello World</span>)
  })

  // Shallow rendering doesn't yet support refs, see https://facebook.github.io/react/docs/test-utils.html
  // it('should preserve refs', () => {
  //   const renderer = TestUtils.createRenderer()
  //   renderer.render(<TestComponent inputComponent="textarea" />)
  //   const output = renderer.getRenderOutput()

  //   expect( output ).toIncludeJSX(<textarea ref="input" />)
  // })

})
