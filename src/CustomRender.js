import React from 'react'
import invariant from 'invariant'
import createPropMap from 'prop-map'

function shouldMerge(key, options) {
  const array = options.merge.concat(options.customMerge)

  return array.some( (pattern) => {
    if (typeof pattern === 'string') {
      return key === pattern
    }
    return key.match(pattern) 
  })
}

function mergeProp(oldProp, newProp) {
  if (!oldProp) { return newProp }
  if (!newProp) { return oldProp }

  if (typeof oldProp === 'string' && typeof newProp === 'string') {
    return oldProp + ' ' + newProp
  }

  if (Array.isArray(oldProp) && Array.isArray(newProp)) {
    return oldProp.concat(newProp)
  }

  if (typeof oldProp === 'object' && typeof newProp === 'object' ) {
    return Object.assign( {}, oldProp, newProp )
  }


  if (typeof oldProp === 'function' && typeof newProp === 'function' ) {
    return (...args) => {
      oldProp(...args)
      newProp(...args) 
    }
  }

  // If type of prop does not align, return the new one
  return newProp || oldProp
}

function mergeDefaultAndCustomProps( defaultProps, customProps, options ) {
  const defaultKeys = Object.keys(defaultProps)
  const customKeys = Object.keys(customProps)

  const keys = defaultKeys.concat(customKeys)

  return keys.reduce( (merged, key) => {

    if (key === 'component') {
      merged.component = customProps.component || defaultProps.component
    }

    if ( merged.hasOwnProperty(key) ) {
      return merged
    }

    if ( shouldMerge(key, options) ) {
      merged[key] = mergeProp( defaultProps[key], customProps[key] )
      return merged
    }

    merged[key] = customProps.hasOwnProperty(key) ? customProps[key] : defaultProps[key]
    return merged
  }, {})
}

function renderWrapper(wrapperProps, child) {
  const { component, ...passProps } = wrapperProps

  invariant(component, 'passed wrapProps to customRender without a wrapper component')

  return React.createElement(component, passProps, child)
}

const customRender = (defaultProps, customProps, params) => {
  const opts = Object.assign({
    merge: ['className', 'style', /^on[A-Z]/],
    customMerge: [],
    mergeMethod: mergeProp
  }, params)

  const mergedProps = customProps
    ? mergeDefaultAndCustomProps( defaultProps, customProps, opts )
    : defaultProps

  const { component, ...passProps } = mergedProps
  
  invariant(component, 'customRender must be passed a component prop.')

  return React.createElement(component, passProps)
}

export const customRenderWithWrapper = (defaultProps, customProps, params) => {
  const opts = Object.assign({
    merge: ['className', 'style', /^on[A-Z]/],
    customMerge: [],
    mergeMethod: mergeProp,
    wrapperKey: 'wrapper'
  }, params)

  const defaultWrapper = createPropMap(defaultProps, [wrapperKey])[wrapperKey]
  const customWrapper = createPropMap(customProps, [wrapperKey])[wrapperKey]

  const wrapperProps = customWrapper && defaultWrapper
    ? mergeDefaultAndCustomProps(defaultWrapper, customWrapper)
    : defaultWrapper || customWrapper

  const shouldWrap = wrapperProps && Object.keys(wrapperProps).length

  const el = customRender(defaultProps, customProps, params)

  return shouldWrap ? renderWrapper(wrapperProps, el) : el
}

export default customRender

