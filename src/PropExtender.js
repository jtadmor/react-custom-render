import React from 'react'

import assign from 'lodash.assign'
import isEmpty from 'lodash.isempty'
import isString from 'lodash.isstring'
import omit from 'lodash.omit'
import contains from 'lodash.contains'
import without from 'lodash.without'

const isExtensibleProp = key => ['style'].indexOf( key ) > -1

const isHandler = key => !!key.match(/^on[A-Z]/)

export const childrenProps = (name, props) => {
  if (props[name + 'Props']) {
    return props[name + 'Props']
  }

  const keys = Object.keys( props )

  return keys.reduce( ( childProps, key ) => {
    if (key.match( new RegExp( `^${name}[A-Z]`, 'i') ) ) {
      const newKey = key.replace( name, '' )
      if ( isEmpty(newKey) ) { return childProps }
      const lowerFirst = newKey[0].toLowerCase() + newKey.slice(1)
      childProps[lowerFirst] = props[key]
    }
    return childProps
  }, {})
}

/*
  Merges two sets of props together, with custom behavior for style and event handlers.
  ({} defaultProps, {} passedProps) => {} combinedProps
  Style - gets extended
  on[eventName] - if both sets of props have a handler, both are called
*/
function mergeProps( defaultProps, passedProps ) {
  const keys = Object.keys( defaultProps ).concat( Object.keys( passedProps ) )

  return keys.reduce( (merged, key) => {
    if ( merged.hasOwnProperty(key) ) {
      return merged
    } else if ( isExtensibleProp( key ) ) {
      merged[key] = assign( {}, defaultProps[key], passedProps[key] )
    } else if ( isHandler( key ) ) {
      merged[key] = function mergedHandler() {
        if (defaultProps[key]) {
          defaultProps[key].apply(this, arguments)
        }
        if (passedProps[key]) {
          passedProps[key].apply(this, arguments)
        }
      }
    } else {
      merged[key] = passedProps.hasOwnProperty(key) ? passedProps[key] : defaultProps[key]
    }

    return merged
  }, {})
}

const shouldNotRender = ( props, childProps, originalChildProps, name ) => {
  if (childProps.render === false ) { return true }

  if (isFunction( childProps.render ) && !childProps.render( originalChildProps ) ) { return true }

  if (props.strictRender === true || contains( props.strictRender, name ) ) {
    if ( !props[name] && (isEmpty(childProps) || props[name] === false) ) { return true }
  }
}

export function createPropAssignmentMap( props, arrayOfNames ) {
  let propKeys = without(Object.keys(props), ['children', 'ref'] )

  const assigner = arrayOfNames.reduce( (propLookup, name) => {
    if ( contains( propKeys, `${name}Props` ) ) {
      propKeys = without( propKeys, `${name}Props` )
      propLookup[name] = props[`${name}Props`]
      return propLookup
    }

    const nameProps = propKeys.reduce( ( childProps, key ) => {
      if (key.match( new RegExp( `^${name}[A-Z]`, 'i') ) ) {
        const newKey = key.replace( name, '' )
        if ( isEmpty(newKey) ) { return childProps }
        const lowerFirst = newKey[0].toLowerCase() + newKey.slice(1)
        childProps[lowerFirst] = props[key]
        propKeys = without( propKeys, key )
      }
      return childProps
    }, {})

    if ( !isEmpty( nameProps ) ) {
      propLookup[name] = nameProps
    }

    return propLookup
  }, {})

  assigner.$main = propKeys.reduce( (rootProps, key) => {
    return set( rootProps, key, props[key] )
  }, {})

  return assigner
}

export function getNames( children ) {
  if (!children) { return [] }

  const arr = React.Children.toArray( children ).reduce( (refs, child) => {
    if (!child || isString( child ) ) { return refs }

    const displayName = isString( child.type ) ? child.type : child.type.displayName
    const name = displayName && displayName[0].toLowerCase() + displayName.slice(1)
    const ref = isString( child.props.ref ) ? child.props.ref : child.props.exRef

    const childrenNames = getNames( child.props.children )
    return refs.concat( [name, ref].concat( childrenNames ) )
  }, [])

  return unique( arr )
}

/*
  Used to swap out an element
  @Element: a valid React element
  @params: {
    mergeProps: props to be merged using a provided or default merge method
    mergeMethod: (defaultProps, mergeProps) => combinedProps
  }

*/
export function customRender(Element, params) {
  if (!React.isValidElement(Element)) { return null }
  const opts = assign( {},{
    mergeMethod: mergeProps
  }, params)

  const componentProps = Element.props
  const mergedProps = opts.mergeProps ? opts.mergeMethod( componentProps, mergeProps ) : componentProps
  const customComponent = mergedProps.component
  const passProps = omit( mergedProps, 'component' )

  if (customComponent) {
    const isValidElement = React.isValidElement(customComponent)
    if (isValidElement) {
      return React.cloneElement(customComponent, passProps)
    }

    return React.createElement(customComponent, passProps)
  } else if (opts.mergeProps) {
    return React.cloneElement( Element, passProps )
  }

  return Element
}

export function extendChildren( props, children, propAssigner ) {
  if (!children) { return null }

  return React.Children.map( children, child => {
    if (!child) { return null }

    if ( isString( child ) ) { return child }

    const displayName = isString( child.type ) ? child.type : child.type.displayName
    const name = displayName && displayName[0].toLowerCase() + displayName.slice(1)
    const ref = isString( child.props.ref ) ? child.props.ref : child.props.exRef

    if (!name && !ref) { return child }

    const childProps = assign( {}, propAssigner[name], propAssigner[ref] )

    if ( shouldNotRender( props, childProps, child.props, name ) || shouldNotRender( props, childProps, child.props, ref ) ) { return null }

    const mergeMethod = props.mergeMethod || mergeProps
    const mergedProps = mergeMethod( child.props, childProps )

    const updatedChildren = extendChildren( props, child.props.children, propAssigner )

    if ( childProps.component ) {
      const method = React.isValidElement( childProps.component ) ? React.cloneElement : React.createElement
      return method( childProps.component, mergedProps, updatedChildren )
    }

    return React.cloneElement( child, mergedProps, updatedChildren )
  })
}

export default class PropExtender extends React.Component {

  render() {
    const namesArray = getNames( this.props.children )
    const propAssigner = createPropAssignmentMap( this.props, namesArray )

    return (
      <span>{extendChildren( this.props, this.props.children, propAssigner )}</span>
    )
  }
}
