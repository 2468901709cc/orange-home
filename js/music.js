(function() {
  var favorites = JSON.parse(localStorage.getItem('orange_favorites')) || [];
  var allSongs = [];
  var currentPlayingId = null;

  var songListContainer = document.getElementById('songList');
  var songCount = document.getElementById('songCount');
  var pageTitle = document.querySelector('.page-title');
  var loadingText = document.getElementById('loadingText');
  var audioPlayer = document.getElementById('globalPlayer');
  
  var artistMenu = document.getElementById('artistMenu');
  var albumMenu = document.getElementById('albumMenu');

  // 加载数据
  fetch('songs.json')
    .then(response => response.json())
    .then(data => {
      allSongs = data;
      loadingText.style.display = 'none';
      generateMenus(); // 生成歌手和专辑菜单
      renderSongs('all'); // 初始渲染全部
    })
    .catch(error => {
      loadingText.innerText = '❌ 音乐库加载失败，请检查 songs.json 或是否通过本地服务器运行。';
      console.error(error);
    });

  // 自动生成左侧菜单
  function generateMenus() {
    var artists = [...new Set(allSongs.map(song => song.artist))];
    var albums = [...new Set(allSongs.map(song => song.album))];

    artistMenu.innerHTML = '';
    albumsMenu.innerHTML = '';

    // 生成歌手
    artists.forEach(artist => {
      if(artist === "未知歌手") return;
      var li = document.createElement('li');
      li.className = 'menu-item';
      li.dataset.filter = artist;
      li.innerHTML = `<span class="icon">🎤</span> ${artist}`;
      li.addEventListener('click', function() { switchFilter(this, artist); });
      artistMenu.appendChild(li);
    });

    // 生成专辑
    albums.forEach(album => {
      if(!album || album === "未分类") return;
      var li = document.createElement('li');
      li.className = 'menu-item';
      li.dataset.filter = album;
      li.innerHTML = `<span class="icon">💿</span> ${album}`;
      li.addEventListener('click', function() { switchFilter(this, album); });
      albumMenu.appendChild(li);
    });
  }

  // 切换过滤条件的通用函数
  function switchFilter(el, filterValue) {
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    pageTitle.innerText = el.innerText.trim();
    renderSongs(filterValue);
  }

  // 渲染歌曲列表
  function renderSongs(filterType) {
    songListContainer.innerHTML = '';
    var filteredSongs = [];

    if (filterType === 'all') {
      filteredSongs = allSongs;
    } else if (filterType === 'favorites') {
      filteredSongs = allSongs.filter(song => favorites.includes(song.id));
    } else {
      // 匹配歌手或专辑
      filteredSongs = allSongs.filter(song => song.artist === filterType || song.album === filterType);
    }

    songCount.innerText = filteredSongs.length;

    if (filteredSongs.length === 0) {
      songListContainer.innerHTML = '<li style="color: var(--text-muted); padding: 20px;">这里空空如也~</li>';
      return;
    }

    filteredSongs.forEach(song => {
      var isFav = favorites.includes(song.id);
      var li = document.createElement('li');
      li.className = 'song-item';
      li.dataset.id = song.id;
      li.dataset.src = song.src;
      
      li.innerHTML = `
        <div class="song-info">
          <span class="song-name">${song.name}</span>
          <span class="song-artist">${song.artist} · ${song.album}</span>
        </div>
        <div class="song-actions">
          <button class="btn-play">▶ 播放</button>
          <button class="btn-favorite ${isFav ? 'is-fav' : ''}" title="收藏">${isFav ? '❤️' : '♡'}</button>
        </div>
      `;
      songListContainer.appendChild(li);
    });

    bindEvents();
  }

  // 按钮绑定
  function bindEvents() {
    document.querySelectorAll('.btn-favorite').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var songId = this.closest('.song-item').dataset.id;
        if (favorites.includes(songId)) {
          favorites = favorites.filter(id => id !== songId);
        } else {
          favorites.push(songId);
        }
        localStorage.setItem('orange_favorites', JSON.stringify(favorites));
        if (document.querySelector('[data-filter="favorites"]').classList.contains('active')) {
          renderSongs('favorites');
        } else {
          this.classList.toggle('is-fav');
          this.innerHTML = this.classList.contains('is-fav') ? '❤️' : '♡';
        }
      });
    });

    document.querySelectorAll('.btn-play').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var songItem = this.closest('.song-item');
        var songSrc = songItem.dataset.src;
        var songId = songItem.dataset.id;

        if (currentPlayingId === songId && !audioPlayer.paused) {
          audioPlayer.pause();
          this.innerHTML = '▶ 播放';
          return;
        }

        audioPlayer.src = songSrc;
        audioPlayer.play();
        document.querySelectorAll('.btn-play').forEach(b => b.innerHTML = '▶ 播放');
        this.innerHTML = '⏸ 暂停';
        currentPlayingId = songId;
      });
    });
  }

  // 左侧固定菜单绑定
  document.querySelectorAll('.menu-item').forEach(item => {
    if(item.dataset.filter === 'all' || item.dataset.filter === 'favorites'){
      item.addEventListener('click', function() {
        switchFilter(this, this.dataset.filter);
      });
    }
  });

  audioPlayer.addEventListener('ended', function() {
    document.querySelectorAll('.btn-play').forEach(b => b.innerHTML = '▶ 播放');
    currentPlayingId = null;
  });

})();