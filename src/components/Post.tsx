import * as React from "react";
import { Card } from "react-bootstrap";
import  { DbPost  } from "../model/DbPost";
import ReactMarkdown from "react-markdown";
import { Well } from "./Well";

export interface PostProps {
  post: DbPost;
}

const Post = ( props: PostProps ) => (
  <Well style={{background: "white"}}>
    <p style={ { "textAlign": "right" } }>{ props.post.created_on }</p>

    <ReactMarkdown
      key={ props.post.id }
      className="result"
      children={ props.post.content }
      skipHtml={ true }
    />
  </Well>
);

export default Post;
