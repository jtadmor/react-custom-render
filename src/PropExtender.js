import React from 'react'

if (typeof Object.assign !== 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

export function childrenProps(name, props) {
  if (props[name + 'Props']) {
    return props[name + 'Props']
  }

  return Object.keys(props).reduce( ( childProps, key ) => {
    if (key.match( new RegExp( '^' + name + '[^s]') )) {
      const newKey = key.replace( name, '' )
      const lowerFirst = newKey[0].toLowerCase() + newKey.slice(1)
      childProps[lowerFirst] = props[key]
    }
    return childProps;
  }, {});
}

export default class PropExtender extends React.Component {

  extendChildren() {
    return React.Children.map( this.props.children, child => {
      if ( typeof child === 'string' ) {
        return child
      }

      const name = typeof child.type === 'string' ? child.type : child.type.displayName
      const childProps = childrenProps( name, this.props )

      if (childProps.component) {
        const mergedProps = Object.assign( {}, child.props, childProps );

        return React.createElement( childProps.component, mergedProps )
      }

      return React.cloneElement( child, childProps )
    }, this)
  }

  render() {
    return (
      <span>{this.extendChildren()}</span>
    )
  }
}
