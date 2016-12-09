import React, { Component, PropTypes } from 'react';
import {
  Editor,
  EditorState,
  Entity,
  RichUtils,
  ContentState,
  CompositeDecorator,
  AtomicBlockUtils,
  convertToRaw,
  convertFromRaw
} from 'draft-js';

// const {
//         CompositeDecorator,
//         ContentBlock,
//         ContentState,
//         Editor,
//         EditorState,
//         convertFromHTML,
//         convertToRaw,
//       } = Draft

import {
  getSelectionRange,
  getSelectedBlockElement,
  getSelectionCoords
} from '../utils/selection';
import SideToolbar from './SideToolbar';
import InlineToolbar from '../components/InlineToolbar';
import ImageComponent from '../components/ImageComponent';

class RichEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
      inlineToolbar: { show: false }
    };

    this.onChange = (editorState) => {
      // console.log('editor changed');
      // console.log('current content');
      // console.log(editorState.getCurrentContent());
      // console.log('decorator');
      // console.log(editorState.getDecorator());
      // console.log('raw');
      // console.log(convertToRaw(editorState.getCurrentContent()));
      if (!editorState.getSelection().isCollapsed()) {
        const selectionRange = getSelectionRange();
        const selectionCoords = getSelectionCoords(selectionRange);
        this.setState({
          inlineToolbar: {
            show: true,
            position: {
              top: selectionCoords.offsetTop,
              left: selectionCoords.offsetLeft
            }
          }
        });
      } else {
        this.setState({ inlineToolbar: { show: false } });
      }

      this.setState({ editorState });
      setTimeout(this.updateSelection, 0);
    }
    this.focus = () => this.refs.editor.focus();
    this.updateSelection = () => this._updateSelection();
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.handleFileInput = (e) => this._handleFileInput(e);
    this.handleVideoInput = (e) => this._handleVideoInput(e);
    this.handleUploadImage = () => this._handleUploadImage();
    this.handleUploadVideo = () => this._handleUploadVideo();
    this.handleAddingActivity = () => this._handleAddingActivity();
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.insertImage = (file) => this._insertImage(file);
    this.blockRenderer = (block) => {
      // console.log('block Renderer', block.getType());

      // if(block.getEntityAt(0)) {
      //   console.log('data', Entity.get(block.getEntityAt(0)).getData());
      // }

      if (block.getType() === 'atomic') {
        return {
          component: ImageComponent
        };
      }
      return null;
    }
    this.blockStyler = (block) => {
      if (block.getType() === 'unstyled') {
        return 'paragraph';
      }
      return null;
    }
  }

  _updateSelection() {
    const selectionRange = getSelectionRange();
    let selectedBlock;
    if (selectionRange) {
      selectedBlock = getSelectedBlockElement(selectionRange);
    }
    this.setState({
      selectedBlock,
      selectionRange
    });
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  _insertImage(file) {
    const entityKey = Entity.create('IMAGE', 'IMMUTABLE', {type: 'IMAGE', src: URL.createObjectURL(file)});
		this.onChange(AtomicBlockUtils.insertAtomicBlock(
        this.state.editorState,
        entityKey,
        ' '
      ));
  }

  _insertVideo(file) {
    const entityKey = Entity.create('VIDEO', 'IMMUTABLE', {type: 'VIDEO', src: URL.createObjectURL(file)});
    // const entityKey = Entity.create('atomic', 'IMMUTABLE', {src: URL.createObjectURL(file)});
		this.onChange(AtomicBlockUtils.insertAtomicBlock(
        this.state.editorState,
        entityKey,
        ' '
      ));
  }

  _handleFileInput(e) {
    const fileList = e.target.files;
    const file = fileList[0];
    this.insertImage(file);
  }

  _handleVideoInput(e) {
    console.log('handleVideoInput', e.target.files);
    const fileList = e.target.files;
    const file = fileList[0];
    this._insertVideo(file);
  }

  _handleUploadImage() {
    console.log('handleUploadImage');
    this.refs.fileInput.click();
  }

  _handleUploadVideo() {
    console.log('handleUploadVideo');
    this.refs.videoInput.click();
  }

  _handleAddingActivity() {
    console.log('handleAddingActivity');
    const entityKey = Entity.create('ACTIVITY', 'IMMUTABLE', {type: 'ACTIVITY', id: 123});
		this.onChange(AtomicBlockUtils.insertAtomicBlock(
        this.state.editorState,
        entityKey,
        ' '
      ));
  }

  _logContent() {
    console.log('the RAW content vvv');
    console.log(this.state);
    console.log(convertToRaw(this.state.editorState.getCurrentContent()));
    this.refs.rawInput.value = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()), null, 2);
  }

  _insertContent() {
    console.log('attempting to insert data');
    console.log('input is', this.refs.rawInput.value);
    console.log(JSON.parse(this.refs.rawInput.value));

    this.setState({
      editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(this.refs.rawInput.value)))
    });
  }

  _renderToDOM() {
    const span = <span>ABCDEFG</span>
    return span;
  }

  render() {
    const { editorState, selectedBlock, selectionRange } = this.state;
    let sideToolbarOffsetTop = 0;

    if (selectedBlock) {
      const editor = document.getElementById('richEditor');
      const editorBounds = editor.getBoundingClientRect();
      const blockBounds = selectedBlock.getBoundingClientRect();

      sideToolbarOffsetTop = (blockBounds.bottom - editorBounds.top)
                           - 31; // height of side toolbar
    }

    return (
      <div className="wrapper">
        <div style={{zIndex: 10000}}>
          <button onClick={e => this._logContent()}>Log content</button>
          <textarea ref="rawInput" />
          <button onClick={e => this._insertContent()}>Insert content</button>
        </div>

        <div className="editor" id="richEditor" onClick={this.focus}>
          {selectedBlock
            ? <SideToolbar
            editorState={editorState}
            style={{ top: sideToolbarOffsetTop }}
            onToggle={this.toggleBlockType}
            onUploadImage={this.handleUploadImage}
            onUploadVideo={this.handleUploadVideo}
            onAddActivity={this.handleAddingActivity}
            />
          : null
          }
          {this.state.inlineToolbar.show
            ? <InlineToolbar
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
            position={this.state.inlineToolbar.position}
            />
            : null
          }
          <Editor
            blockRendererFn={this.blockRenderer}
            blockStyleFn={this.blockStyler}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder="Write something..."
            spellCheck={true}
            readOnly={this.state.editingImage}
            ref="editor"
            />
          <input type="file" ref="fileInput" style={{display: 'none'}}
            onChange={this.handleFileInput} />
          <input className="videoInput" key="videoInput" type="file" ref="videoInput"
            onChange={this.handleVideoInput} />
        </div>

        <div className="renderer" ref="renderer">{this._renderToDOM()}</div>
      </div>
    );
  }
}

export default RichEditor;
