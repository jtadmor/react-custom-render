<h2>React Custom Render</h2>

<em>A utility method for re-usable components</em>

`npm install react-custom-render`

tl,dr: 

```jsx
import customRender from 'react-custom-render

customRender({
  component: 'button',
  children: 'Click me!',
  className: 'basic-button'
  style: { marginLeft: '10px' }
  onClick: basicHandler
}, {
  component: AwesomeButton
  className: 'awesome-button'
  style: { marginRight: '10px' }
  onClick: awesomeHandler
})
```

will render as

```jsx
<AwesomeButton
  className="basic-button awesome-button"
  style={{
    marginLeft: '10px',
    marginRight: '10px'
  }}
  onClick={ e => {
    basicHandler(e)
    awesomeHandler(e)
  }}>
  Click me!
</AwesomeButton>
```

<h3>Why is this helpful?</h3>

This utility was developed with two main use cases in mind:

1. A re-usable component wants to generally render as a basic component, like a `<button />`, but you'd want to allow parent components to optionally render it as something more awesome, like a custom `<AwesomeButton />`
This is basically a shortcut for:
```
function CustomizableButton({ component, ...otherProps }) {
  return React.createElement(component || 'button', otherProps)
}
```

2. A re-usable component has an event handler to manage local state, but you want to allow parent components to pass in additional handlers.
This is basically a shortcut for:
```
class ToggledDisplay extends Component {
  state = {
    show: true
  }
  
  handleClick = e => {
    this.setState({ show: true })
    
    if (this.props.onClick) { this.props.onClick(e) }
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Toggle!</button>
        { this.state.show && <Display /> }
      </div>
    )
  }
}
```

<h3>Any limitations?</h3>

You must pass a 'component' property.

<h3>Advanced Usage</h3>

You can optionally pass in a third options object that allows you to control how `defaultProps` and `customProps`.
`[] merge`: Array of strings or regex. Keys that match this array will be merged, otherwise they will be replaced. Defaults to `['className', 'style', /^on[A-Z]/]`.
`[] customMerge`: If you want to merge everything that is merged by default, but want to add a few other keys, using customMerge is easier. Defaults to `[]`.
`fn mergeMethod`: Provide your own custom method for combining two props. Will be called with `(oldProp, newProp)`. By default, strings are combined, arrays are concatted, objects are merged with Object.assign, and functions become `(..args) => oldFn(...args) newFn(...args)`.

<h3>Tips, etc.</h3>

This method works well with `createPropMap` ( https://github.com/jtadmor/prop-map )

```jsx
import customRender from 'react-custom-render'
import createPropMap from 'prop-map'

class ToggledDisplay extends Component {
  state = {
    show: true
  }
  
  handleClick = e => {
    this.setState({ show: true })
    
    if (this.props.onClick) { this.props.onClick(e) }
  }

  render() {
    const propMap = createPropMap(this.props)
    const buttonDefaults = {
      component: 'button'
      onClick: this.handleClick
      children: 'Toggle!'
    }

    return (
      <div>
        { customRender( buttonDefaults, propMap.button ) }
        { this.state.show && <Display /> }
      </div>
    )
  }
}
```

then

```jsx
<ToggledDisplay buttonComponent=AwesomeButton buttonClassName="awesome-class" buttonChildren="Awesome Toggle!" />
```

now ToggledDisplay is like:

```jsx
<div>
  <AwesomeButton className="awesome-class" onClick={this.handleClick}>Awesome Toggle!</AwesomeButton>
  {  this.state.show && <Display /> }
</div>
```




