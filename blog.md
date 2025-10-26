---
layout: default
title: "All Blog Posts"
permalink: /blog/
---

<section class="page-section">
  <h1>🧠 Blog Archive</h1>
  <p>Browse all posts from AutoShiftOps — from DevOps insights to automation guides.</p>

  <ul class="post-list container">
    {% for post in site.posts %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <span class="post-date">{{ post.date | date: "%b %d, %Y" }}</span>
        <p>{{ post.excerpt | strip_html | truncate: 160 }}</p>
      </li>
    {% endfor %}
  </ul>
</section>
