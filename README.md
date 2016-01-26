# react-extend-props-component
Wrapper for re-usable components that allows for easy customization

To use: npm install react-prop-extender

This library exports several utility methods, and a component wrapper that combines their functionality.


createPropAssignmentMap ({} props, [] arrayOfNames) => {
  return {} mappingOfPropsByStartsWithName
  
  e.g. { itemClassName } => { item: { className } }

  any prop that matches none of the names is put on a $main key

  e.g. { style, itemClassName } => { item: { className }, $main: { style } }
}


childrenProps( string name, {} props ) => {
  return {} allPropsStartingWithName

  same as createPropAssignmentMap(props, [name]).name
}


getNames( React.Children children ) => {
  returns [] arrayOfNames

  based on displayName (or type for basic DOM nodes) of children (recursively)
}


customRender( React.Element Element, {} params ) => {
  returns React.Element CustomElement

  Used to swap out an element
  @params: {
    mergeProps: props to be merged using a provided or default merge method
    mergeMethod: (defaultProps, mergeProps) => combinedProps
  }

  Default merge method extends style, calls both event handlers if both original and merge props contain one.
}


extendChildren( {} props, React.Children children, propAssignmentMap ) => {
  returns React.Children mutatedChildren
}


Use PropExtender like:

const { children, ...props } = this.props

<PropExtender {...props}>
  <h2>Title</h2>
  <FooComponent />
  <BarComponent />
  { children }
</PropExtender>

Accepts props, automatically generates names based on displayName / DOM node type (and string ref, if provided) of children, extends props, and does customRender on all.



