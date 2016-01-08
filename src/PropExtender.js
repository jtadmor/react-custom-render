import React from 'react'
import _ from 'lodash'

const isExtensibleProp = key => ['style'].indexOf( key ) > -1

const isHandler = key => !!key.match(/^on[A-Z]/)

export const childrenProps = (name, props) => {
  if (props[name + 'Props']) {
    return props[name + 'Props']
  }

  return Object.keys(props).reduce( ( childProps, key ) => {
    if (key.match( new RegExp( '^' + name, 'i') ) && key !== `${name}s`) {
      const newKey = key.replace( name, '' )
      if ( _.isEmpty(newKey) ) { return childProps }
      const lowerFirst = newKey[0].toLowerCase() + newKey.slice(1)
      childProps[lowerFirst] = props[key]
    }
    return childProps
  }, {})
}

function mergeProps( defaultProps, passedProps ) {
  const keys = Object.keys( defaultProps ).concat( Object.keys( passedProps ) )
  return keys.reduce( (merged, key) => {
    if ( merged.hasOwnProperty(key) ) {
      return merged
    } else if ( isExtensibleProp( key ) ) {
      merged[key] = _.extend( {}, defaultProps[key], passedProps[key] )
    } else if ( isHandler( key ) ) {
      merged[key] = function mergedHandler() {
        if (defaultProps[key]) { defaultProps[key].apply(this, arguments) }
        if (passedProps[key]) { passedProps[key].apply(this, arguments) }
      }
    } else {
      merged[key] = passedProps.hasOwnProperty(key) ? passedProps[key] : defaultProps[key]
    }

    return merged
  }, {})
}

const shouldNotRender = ( props, childProps, name ) => {
  if (childProps.render === false ) { return true }

  if (props.strictRender === true || _.contains( props.strictRender, name ) ) {
    if ( !props[name] && (_.isEmpty(childProps) || props[name] === false) ) { return true }
  }
}

export function extendChildren( props, children ) {
  if (!children) { return null }

  return React.Children.map( children, child => {
    if (!child) { return null }
    if ( typeof child === 'string' ) { return child }

    const name = typeof child.type === 'string' ? child.type : child.type.displayName
    const ref = typeof child.props.ref === 'string' ? child.props.ref : child.props.eRef

    if (!name && !ref) { return null }

    const nameProps = name ? childrenProps( name, props ) : {}
    const refProps = ref ? childrenProps( ref, props ) : {}
    const childProps = _.extend( {}, nameProps, refProps )

    if ( shouldNotRender( props, childProps, name ) || shouldNotRender( props, childProps, ref ) ) { return null }

    const mergeMethod = props.mergeMethod || mergeProps
    const mergedProps = mergeMethod( child.props, childProps )

    const updatedChildren = extendChildren( props, child.props.children )

    if ( childProps.component ) {
      const method = React.isValidElement( childProps.component ) ? React.cloneElement : React.createElement
      return method( childProps.component, mergedProps, updatedChildren )
    }

    return React.cloneElement( child, mergedProps, updatedChildren )
  })
}

export default class PropExtender extends React.Component {

  render() {
    return (
      <span>{extendChildren(this.props, this.props.children)}</span>
    )
  }
}
