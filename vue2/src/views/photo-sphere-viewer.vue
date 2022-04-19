<template>
  <div id="viewer"></div>
</template>
<script>
    import {Viewer} from 'photo-sphere-viewer'
    import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'
    export default {
        data(){
            return{
                viewer:'',
                imgurl1:require('../assets/1.webp'),
            }
        },
        mounted(){
            this.viewer = new Viewer({
                container:document.querySelector('#viewer'),
                panorama:this.imgurl1,
                size:{
                    width: '100vw',
                    height: '50vh',
                },
            });
        }
    }
</script>