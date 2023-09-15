function quickcd {
    DIR_PATH=$( [[ ! -z "$1" ]] && (quick-change-directory $1 --notab 3>&1 1>&2 2>&3) || (quick-change-directory --notab 3>&1 1>&2 2>&3) );
    [[ ! -z "$DIR_PATH" ]] && cd $DIR_PATH || echo "CANCELLED";
};
