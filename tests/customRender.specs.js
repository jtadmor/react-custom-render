import React, { Component } from 'react'
import { createRenderer, Simulate } from 'react-addons-test-utils'
import expect from 'expect'
import expectJSX from 'expect-jsx'

import customRender from '../src/CustomRender'

expect.extend(expectJSX)


function Substitution(props) {
  return (
    <span>
      {props.text}
    </span>
  )
}

const firstHandler = e => {
  console.log('First')
}

const secondHandler = e => {
  console.log('Second')
}

class TestComponent extends Component {
  render() {
    const defaultProps = {
      component: 'button',
      onClick: firstHandler
    }

    return customRender( defaultProps, this.props )
  }
}

const defaultProps = {
  component: 'h1',
  children: 'Hello World',
}

describe('customRender', () => {
  it('should be a function', () => {
    expect(typeof customRender).toBe('function')
  })

  it('should not affect rendering if no props are passed', () => {
    const noSwap = customRender(defaultProps)

    expect( noSwap ).toEqualJSX(<h1>Hello World</h1>)
  })

  it('should use mergeProps to swap render', () => {
    const swap = customRender(defaultProps, {
      component: 'h3'
    })

    expect( swap ).toEqualJSX(<h3>Hello World</h3>)
  })

  it('should render composite components', () => {
    const swap = customRender(defaultProps, {
      component: TestComponent
    })

    expect( swap ).toEqualJSX(<TestComponent>Hello World</TestComponent>)
  })

  it('should copy over default props', () => {
    const swap = customRender({
      component: 'h1',
      text: 'Hello World'
    }, {
      component: Substitution
    })

    const renderer = createRenderer()
    renderer.render(swap)
    const output = renderer.getRenderOutput()

    expect( output ).toEqualJSX(<span>Hello World</span>)
  })

  // TODO: test cases for merged props
  it('should combine className', () => {
    const combine = customRender({
      component: 'h1',
      children: 'Hello World',
      className: 'text'
    }, {
      className: 'awesome'
    })

    expect( combine ).toEqualJSX(<h1 className="text awesome">Hello World</h1>)
  })

  it('should merge style', () => {
    const combine = customRender({
      component: 'h1',
      children: 'Hello World',
      style: { color: 'red', backgroundColor: 'blue'}
    }, {
      style: { color: 'black', margin: '10px' }
    })

    expect( combine ).toEqualJSX(<h1 style={{ color: 'black', backgroundColor: 'blue', margin: '10px'}}>Hello World</h1>)
  })

  // TODO: Combined handlers
  // TODO: Custom merge props

  it('should wrap a component', () => {
    const wrapped = customRender({
      component: 'h1',
      children: 'Hello World'
    }, {
      wrapperComponent: 'div',
      wrapperClassName: 'test-class'
    })

    expect( wrapped ).toEqualJSX(
      <div className="test-class">
        <h1>Hello World</h1>
      </div>
    )
  })
})
