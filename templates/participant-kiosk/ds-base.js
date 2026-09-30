(() => {
  const base = '../..';
  for (const p of ['styles.css']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  // The bundle must be evaluated BEFORE the component scripts below it, because they
  // read window.<Namespace> at parse time. document.write keeps it in document order;
  // an appended <script> would load async and leave those globals undefined.
  document.write('<script src="' + base + '/_ds_bundle.js"><\/script>');
})();
