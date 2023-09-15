# start: quickcd

function quickcd {
  if [[ "$@" == *"--tab"* ]]
  then
    quick-change-directory "$@";
  else
    DIR_PATH=$(quick-change-directory "$@" --path-to-stderr --no-tab 3>&1 1>&2 2>&3);
    
    if [[ ! -z "$DIR_PATH" ]]
    then
      cd "$DIR_PATH"
    fi
  fi
}

# -- quickcd-shell-aliases --

# end: quickcd
