  # Regular Colors
  black="\033[38;5;0m"
  red="\033[38;5;1m"
  green="\033[38;5;2m"
  yellow="\033[38;5;3m"
  blue="\033[38;5;4m"
  magenta="\033[38;5;5m"
  cyan="\033[38;5;6m"
  white="\033[38;5;7m"#

  # Background
  on_black="\033[48;5;0m"
  on_red="\033[48;5;1m"
  on_green="\033[48;5;2m"
  on_yellow="\033[48;5;3m"
  on_blue="\033[48;5;4m"
  on_magenta="\033[48;5;5m"
  on_cyan="\033[48;5;6m"
  on_white="\033[48;5;7m"
  line="#{on_red}#{white}"
  reset="\033[0m"

  splash = <<-HEREDOC
#{red}                       #{reset}
#{red}                       #{reset}
#{red}  ▌ ▐· ▌ ▐· ▌ ▐· ▄▄▄·  #{reset}
#{red} ▪█·█▌▪█·█▌▪█·█▌▐█ ▀█  #{reset}
#{red} ▐█▐█•▐█▐█•▐█▐█•▄█▀▀█  #{reset}
#{red}  ███  ███  ███ ▐█ ▪▐▌ #{reset}
#{red} . ▀  . ▀  . ▀   ▀  ▀  #{reset}
#{red}       Ubuntu          #{reset}
#{red}                       #{reset}
  HEREDOC

  puts splash