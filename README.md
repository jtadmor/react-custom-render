<h2>React Custom Render</h2>

<em>A utility method for re-usable components</em>

To use: npm install react-custom-render

`import customRender from 'react-custom-render`

tl,dr: 

```jsx
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
}) =>

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




