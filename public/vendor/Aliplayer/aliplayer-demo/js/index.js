var player = null;

$(function(){
    //初始化创建一个播放器
    player = createPlayer();
    player.on('ready',function(){
      console.log('ready可以调用播放器的方法了');
    });

    player.on('play',function(){
      console.log('开始播放(play)');
    });

    player.on('pause',function(){
       console.log('暂停播放(pause)');
     });

    //切换不同格式视频
    $('.change').on('click',function(){
        var source = $('.source').val();
        var playAuth = $('.playauth').val();
        player = createPlayer(source,playAuth);
    })

    //提交播放
    $('.submit').on('click',function(){
        var source = $('.source').val();
        var playAuth = $('.playauth').val();
        if(!source)
        {
            return;
        }
        if(source.indexOf('//')!=-1)
        {
            player.loadByUrl(source);
        }
        else if(playAuth)
        {
            if(player.replayByVidAndPlayAuth)
            {
                player.replayByVidAndPlayAuth(source, playAuth);
            }
            else
            {
                player = createPlayer(source,playAuth);
            }
        }
    });
});


/**
 * 创建一个新的播放器
 * @param source {string} 播放地址
 * @param playauth
 * @returns {Aliplayer}
 */
function createPlayer(source, playauth)
{
    if(player)
    {
        player.dispose();
        $('#J_prismPlayer').empty();
        player = null;
    }
    var vid = source;
    if(!source && !playauth)
    {
        //默认播放
        source = '//player.alicdn.com/video/aliyunmedia.mp4';
        vid = "";
        playauth = "";
    }
    else if(source.indexOf('//')!=-1)
    {
        playAuth = "";
    }
    else if(playauth)
    {
        source = "";
    }
    //播放器配置参数
    var option = {
    id: "J_prismPlayer",
         autoplay: true,
         isLive:false,
         playsinline:true,
         width:"100%",
         height:"100%",
         controlBarVisibility:"click",
         useH5Prism:false, //启用H5播放器
         useFlashPrism:false,

        //支持播放地址播放,此播放优先级最高
        source : '播放url',

        //播放方式二：点播用户推荐
        vid : '1e067a2831b641db90d570b6480fbc40',
        playauth : '',
        cover: 'http://liveroom-img.oss-cn-qingdao.aliyuncs.com/logo.png',
    };

    return new Aliplayer(option);
}