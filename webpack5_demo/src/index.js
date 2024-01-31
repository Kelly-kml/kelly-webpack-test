/*
 * @Description: 
 * @author: kelly
 * @Date: 2024-01-19 17:39:19
 * @LastEditTime: 2024-01-21 21:53:11
 */
import _ from 'lodash';
import printMe from './print.js';
import './index.css';

function component () {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  btn.innerHTML = 'Click me and check the console!';
  btn.onclick = printMe;  // onclick 事件仍然绑定着原本的 printMe 函数

  element.appendChild(btn);

  return element;
}

let element = component();
document.body.appendChild(element);