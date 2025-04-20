import feedparser

rss_url = "https://news.google.com/rss/search?q=agriculture+india&hl=en-IN&gl=IN&ceid=IN:en"
feed = feedparser.parse(rss_url)

for entry in feed.entries[:5]:
    print("Title:", entry.title)
    print("Link:", entry.link)
    print("Published:", entry.published)
    print("---")
