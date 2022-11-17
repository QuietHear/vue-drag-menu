/*
 * @Author: aFei
 * @Date: 2022-11-17 14:27:47
*/
/*
 * @LastEditors: aFei
 * @LastEditTime: 2022-11-17 14:52:16
 */
import vueDragMenu from './vueDragMenu';

const comment = {
  install(Vue) {
    Vue.component('vueDragMenu', vueDragMenu);
  },
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(comment);
}

export default comment;