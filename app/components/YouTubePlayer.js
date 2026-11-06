// Lecteur YouTube (mode confidentialité renforcée). `id` vient toujours de youtubeId() : 11 caractères sûrs.
export default function YouTubePlayer({ id, title }) {
  return (
    <div className="yt">
      <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={title} loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>)
}
