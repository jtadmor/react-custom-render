var React = require('react')
var expect = require('expect')
var expectJSX = require('expect-jsx')

var PropExtender = require('../build/PropExtender')

expect.extend(expectJSX)

// class TestComponent extends React.Component {
//   render() {
//     const propMap = createPropAssignmentMap(
//       this.props,
//       ['title', 'list', 'item']
//     )

//     return (
//       <div {...propMap.$main}>
//         <h1 {...propMap.title}>Title</h1>
//         <ul {...propMap.list}>
//           {
//             ['a', 'b', 'c'].map( (v, i) => {
//               return (
//                 <li {...propMap.item} key={i}>
//                   {v}
//                 </li>
//               )
//             })
//           }
//         </ul>
//       </div>
//     )
//   }
// }

