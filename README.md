# hejnoah.com

My personal website and blog, [hejnoah.com](https://hejnoah.com).

Feedback and contributions are welcome, see [here](https://hejnoah.com/about/).


# Notes

*Mostly for myself.*

* Local setup: This should work with the Ruby version included in macOS Mojave (`ruby 2.3.7p456 (2018-03-28 revision 63024) [universal.x86_64-darwin18]`) and possibly newer and/or older. Run `sudo gem install bundler jekyll` (see below if that times out), then (in the root directory of this repository) `bundle install`.
* Server setup: Similar, I guess? I'll re-figure it out when I'm forced to.
* Deployment thingy: Described in the first blog post.
* Run `networksetup -setv6off “Wi-Fi”` before doing any fancy Ruby stuff because `api.rubygems.org` (or something on the way there) can't properly speak IPv6. Then turn it back on again using `networksetup -setv6automatic “Wi-Fi”`. Ugh.
* Files to be used in posts are to be sorted into `static/`, theme assets into `assets/`.
