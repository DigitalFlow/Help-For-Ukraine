import * as React from "react";
import { Card } from "react-bootstrap";
import DbPost from "../model/DbPost";
import ReactMarkdown from "react-markdown";
import { Well } from "./Well";

export interface PostViewProps {
  post: DbPost;
}

const PostView = ( props: PostViewProps ) => (
  <Well>
    <p style={ { "textAlign": "right" } }>{ props.post.created_on }</p>

    <ReactMarkdown
      key={ props.post.id }
      className="result"
      children={ props.post.content }
      skipHtml={ true }
    />
  </Well>
);

export default PostView;
