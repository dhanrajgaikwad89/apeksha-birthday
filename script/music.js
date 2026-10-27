/* Original gentle instrumental synthesized locally; no third-party recording. */
(() => {
  const music = {
    context: null, master: null, timer: null, wanted: false, busy: false, next: 0, bar: 0,
    async set(enabled) {
      if (this.busy) return;
      this.busy = true;
      try {
        if (!enabled) {
          this.wanted = false;
          clearInterval(this.timer);
          if (this.context) { const old = this.context; this.context = null; await old.close(); }
        } else {
          const Audio = window.AudioContext || window.webkitAudioContext;
          if (!Audio) throw new Error('Audio unavailable');
          if (!this.context) {
            this.context = new Audio();
            this.master = this.context.createGain();
            this.master.gain.value = .15;
            this.master.connect(this.context.destination);
            this.next = this.context.currentTime + .1;
            this.bar = 0;
          }
          await this.context.resume();
          this.wanted = true;
          this.schedule();
          clearInterval(this.timer);
          this.timer = setInterval(() => this.schedule(), 1000);
        }
      } catch {
        this.wanted = false;
        clearInterval(this.timer);
        if (this.context) { await this.context.close().catch(() => {}); this.context = null; }
        document.getElementById('sound-status').textContent = 'Music could not start. Tap Music off to try again.';
      } finally { this.busy = false; this.update(); }
    },
    note(midi, start, duration, volume) {
      const ctx = this.context, envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(volume, start + .035);
      envelope.gain.exponentialRampToValueAtTime(.001, start + duration);
      envelope.connect(this.master);
      let remaining = 3;
      [1, 2, 3].forEach((multiple, i) => {
        const osc = ctx.createOscillator(), level = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12) * multiple;
        level.gain.value = [1, .22, .06][i];
        osc.connect(level); level.connect(envelope);
        osc.start(start); osc.stop(start + duration + .05);
        osc.onended = () => { osc.disconnect(); level.disconnect(); if (--remaining === 0) envelope.disconnect(); };
      });
    },
    schedule() {
      if (!this.context || !this.wanted) return;
      const chords = [[48,55,60,64],[45,52,57,60],[41,48,53,57],[43,50,55,59]];
      const melody = [[76,74,72,67],[72,69,67,64],[69,72,74,72],[71,67,69,74],[76,79,76,72],[72,76,74,69],[69,72,77,76],[74,71,67,72]];
      const beat = 60 / 72;
      while (this.next < this.context.currentTime + 5) {
        const chord = chords[this.bar % 4];
        [0,2,1,3,2,1,3,2].forEach((position,i) => this.note(chord[position],this.next+i*beat/2,2.8,.22));
        melody[this.bar % 8].forEach((note,i) => this.note(note,this.next+i*beat,2.6,.14));
        this.note(chord[0]-12,this.next,3.6,.18);
        this.next += beat * 4; this.bar++;
      }
    },
    update() {
      const button = document.getElementById('music-toggle');
      button.setAttribute('aria-pressed', String(this.wanted));
      button.setAttribute('aria-label', this.wanted ? 'Turn background music off' : 'Play gentle background music');
      button.querySelector('span').textContent = this.wanted ? 'Music on' : 'Music off';
    }
  };
  document.getElementById('music-toggle').addEventListener('click', () => music.set(!music.wanted));
  window.BirthdayMusic = music;
})();
