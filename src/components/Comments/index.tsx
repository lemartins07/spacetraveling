import { useEffect, useRef } from 'react';

export function Comments(): JSX.Element {
  const commentBox = useRef<HTMLDivElement>();

  useEffect(() => {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', 'true');
    scriptEl.setAttribute('repo', 'lemartins07/spacetraveling');
    scriptEl.setAttribute('issue-term', 'pathname');
    scriptEl.setAttribute('theme', 'photon-dark');
    commentBox.current.appendChild(scriptEl);
  }, []);

  return (
    <div style={{ width: '100%' }} id="comments">
      <div ref={commentBox} />
    </div>
  );
}
