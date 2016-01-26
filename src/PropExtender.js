import React from 'react'
import _ from 'lodash'

export const childrenProps = (name, props) => {
  if (props[name + 'Props']) {
    return props[name + 'Props']
  }

  const keys = Object.keys( props )

  return keys.reduce( ( childProps, key ) => {
    if (key.match( new RegExp( `^${name}[A-Z]`, 'i') ) ) {
      const newKey = key.replace( name, '' )
      if ( _.isEmpty(newKey) ) { return childProps }
      const lowerFirst = newKey[0].toLowerCase() + newKey.slice(1)
      childProps[lowerFirst] = props[key]
    }
    return childProps
  }, {})
}

const isExtensibleProp = key => ['style'].indexOf( key ) > -1

const isHandler = key => !!key.match(/^on[A-Z]/)


/*
  Merges two sets of props together, with custom behavior for style and event handlers.
  ({} defaultProps, {} passedProps) => {} combinedProps
  Style - gets extended
  on[eventName] - if both sets of props have a handler, both are called
*/
function mergeDefaultAndCustomProps( defaultProps, passedProps ) {
  const keys = _.union( _.keys( defaultProps ), _.keys( passedProps ) )

  return keys.reduce( (merged, key) => {
    if ( merged.hasOwnProperty(key) ) {
      return merged
    } else if ( isExtensibleProp( key ) ) {
      merged[key] = _.assign( {}, defaultProps[key], passedProps[key] )
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

  if (_.isFunction( childProps.render ) && !childProps.render( originalChildProps ) ) { return true }

  if (props.strictRender === true || _.includes( props.strictRender, name ) ) {
    if ( !props[name] && (_.isEmpty(childProps) || props[name] === false) ) { return true }
  }
}

export const createPropAssignmentMap = ( props, arrayOfNames ) => {
  let propKeys = _.without(Object.keys(props), ['children', 'ref'] )

  const assigner = arrayOfNames.reduce( (propLookup, name) => {
    if ( _.includes( propKeys, `${name}Props` ) ) {
      propKeys = _.without( propKeys, `${name}Props` )
      propLookup[name] = props[`${name}Props`]
      return propLookup
    }

    const nameProps = propKeys.reduce( ( childProps, key ) => {
      if (key === name) {
        propKeys = _.without( propKeys, key )
        return childProps
      } else if (key.match( new RegExp( `^${name}[A-Z]`) ) ) {
        propKeys = _.without( propKeys, key )
        const newKey = key.replace( name, '' )
        const lowerFirst = newKey[0].toLowerCase() + newKey.slice(1)
        childProps[lowerFirst] = props[key]
      }
      return childProps
    }, {})

    if ( !_.isEmpty( nameProps ) ) {
      propLookup[name] = nameProps
    }

    return propLookup
  }, {})

  assigner.$main = propKeys.reduce( (rootProps, key) => {
    rootProps[key] = props[key]
    return rootProps
  }, {})

  return assigner
}

export const getNames = children => {
  if (!children) { return [] }

  const arr = React.Children.toArray( children ).reduce( (refs, child) => {
    if (!child || _.isString( child ) ) { return refs }

    const displayName = _.isString( child.type ) ? child.type : child.type.displayName
    const name = displayName && displayName[0].toLowerCase() + displayName.slice(1)
    const ref = _.isString( child.props.ref ) ? child.props.ref : child.props.exRef

    const childrenNames = getNames( child.props.children )
    return refs.concat( [name, ref].concat( childrenNames ) )
  }, [])

  return _.uniq( arr )
}

/*
  Used to swap out an element
  @Element: a valid React element
  @params: {
    customProps: props to be merged using a provided or default merge method
    mergeMethod: (defaultProps, customProps) => combinedProps
  }

*/
export const customRender = (Element, params) => {
  if (!React.isValidElement(Element)) { return null }
  const opts = _.assign( {},{
    mergeMethod: mergeDefaultAndCustomProps
  }, params)
  
  const componentProps = Element.props
  const mergedProps = opts.customProps ? opts.mergeMethod( componentProps, opts.customProps ) : componentProps
  const { component, ...passProps } = mergedProps

  if (component) {
    const isValidElement = React.isValidElement(component)
    if (isValidElement) {
      return React.cloneElement(component, passProps)
    }

    return React.createElement(component, passProps)
  } else if (opts.mergeProps) {
    return React.cloneElement( Element, passProps )
  }

  return Element
}

export const extendChildren = ( props, children, propAssigner ) => {
  if (!children) { return null }

  return React.Children.map( children, child => {
    if (!child) { return null }

    if ( _.isString( child ) ) { return child }

    const displayName = _.isString( child.type ) ? child.type : child.type.displayName
    const name = displayName && displayName[0].toLowerCase() + displayName.slice(1)
    const ref = _.isString( child.props.ref ) ? child.props.ref : child.props.exRef

    if (!name && !ref) { return child }

    const childProps = _.assign( {}, propAssigner[name], propAssigner[ref] )

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
