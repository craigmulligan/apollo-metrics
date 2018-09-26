import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const QUERY = gql`
  {
    hello
  }
`

export default () => (
  <Query query={QUERY}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading...'
      if (error) return `Error! ${error.message}`

      return <div>{data.hello}</div>
    }}
  </Query>
)
