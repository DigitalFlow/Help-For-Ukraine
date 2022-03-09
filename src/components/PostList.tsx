import * as React from "react";
import  { DbPost  } from "../model/DbPost";
import { Tab, Row, Col, NavItem, Nav, ButtonToolbar, ButtonGroup, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ExtendedIBaseProps } from "../domain/IBaseProps";
import { withRouter } from "react-router-dom";
import { ReactTable } from "./ReactTable";
import { Column } from "react-table";

export interface PostListState {
  posts: Array<DbPost>;
  columns: Array<Column<DbPost>>;
}

class PostList extends React.PureComponent<ExtendedIBaseProps, PostListState> {
  constructor (props: ExtendedIBaseProps) {
    super(props);

    this.state = {
      posts: [],
      columns: [
        {
            Header: "Content",
            accessor: (p) => {
                let content = p.content || "";
                content = content.trim();

                const firstLineBreak = content.indexOf("\n");

                if (firstLineBreak !== -1) {
                content = content.substr(0, firstLineBreak);
                }

                return content.replace(/[#]*/g, "");
            }
        },
        {
            Header: "Created On",
            accessor: "created_on",
        }
      ]
    };

    this.fetchPosts = this.fetchPosts.bind(this);
  }

  fetchPosts () {
    return fetch("/posts",
    {
      credentials: "include"
    })
    .then(results => {
      return results.json();
    })
    .then((posts: Array<DbPost>) => {
        this.setState({
            posts: posts
        });
    });
  }

  componentDidMount() {
    this.fetchPosts();
  }

  render () {
    return (
      <div>
        <ButtonToolbar>
          <ButtonGroup>
            <LinkContainer key={ "newLink" } to={ "/post/new" }>
              <Button style={{margin: "5px" }} variant="primary">New Post</Button>
            </LinkContainer>
          </ButtonGroup>
        </ButtonToolbar>
        <ReactTable columns={this.state.columns} data={this.state.posts} navigationPath="post" />
      </div>
    );
  }
}

export default withRouter(PostList);