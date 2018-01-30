import React, { Component } from 'react';

import {
  TouchableHighlight,
  Text,
  StyleSheet
} from 'react-native';
import { ComponentsStyle } from '../../styles/Components';
import { CommonStyle } from '../../styles/Common';

export default class TransparentButton extends Component {
  onPressAction = () => {
    if (this.props.disabled) {
      return;
    }

    this.props.onPress();
  };

  render() {
    return (
      <TouchableHighlight
        activeOpacity={this.props.disabled ? 1 : 0.7}
        underlayColor="transparent"
        onPress={this.onPressAction}
        style={[
          ComponentsStyle.button,
          style.button,
          this.props.style,
          { borderColor: this.props.color || '#000' }
        ]}
      >
        <Text
          style={[
            CommonStyle.paddingLeft,
            CommonStyle.paddingRight,
            style.buttonText,
            this.props.textStyle,
            { color: this.props.color || '#000' }
          ]}
        >{this.props.title}</Text>
      </TouchableHighlight>
    );
  }
}

const style = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    textAlign: 'center',
  }
});
