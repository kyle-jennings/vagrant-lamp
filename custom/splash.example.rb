#
# bash raw code colors
# https://gist.github.com/vratiu/9780109
#
# more modern termincal colors with varying support
# https://misc.flogisoft.com/bash/tip_colors_and_formatting
#

# text colors
black = "\033[38;5;0m"
red = "\033[38;5;1m"
green = "\033[38;5;2m"
yellow = "\033[38;5;3m"
blue = "\033[38;5;4m"
magenta = "\033[38;5;5m"
cyan = "\033[38;5;6m"
white = "\033[38;5;7m"
orange = "\e[38;5;202m"
purple = "\e[38;5;92m"

# Background
on_black = "\033[48;5;0m"
on_red = "\033[48;5;1m"
on_green = "\033[48;5;2m"
on_yellow = "\033[48;5;3m"
on_blue = "\033[48;5;4m"
on_magenta = "\033[48;5;5m"
on_cyan = "\033[48;5;6m"
on_white = "\033[48;5;7m"
on_orange = "\033[48;5;202m"
on_purple = "\033[48;5;92m"

# color combos
white_on_red = "#{on_red}#{white}"
white_on_purple = "#{on_purple}#{white}"

# misc
underline = "\033[4m"
reset = "\033[0m"
blink = "\033[5m"


splash = <<-HEREDOC
#{line}                       #{reset}
#{line}                       #{reset}
#{line}  ▌ ▐· ▌ ▐· ▌ ▐· ▄▄▄·  #{reset}
#{line} ▪█·█▌▪█·█▌▪█·█▌▐█ ▀█  #{reset}
#{line} ▐█▐█•▐█▐█•▐█▐█•▄█▀▀█  #{reset}
#{line}  ███  ███  ███ ▐█ ▪▐▌ #{reset}
#{line} . ▀  . ▀  . ▀   ▀  ▀  #{reset}
#{line}       Ubuntu          #{reset}
#{line}                       #{reset}
  HEREDOC

puts splash