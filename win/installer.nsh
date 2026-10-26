; 右クリックの「ちょこっとPLAYERで開く」。1.1.1 のインストーラーと同じく、
; 自分のユーザーの範囲（HKCU）だけに登録し、アンインストールで消す。
!macro customInstall
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp3\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp3\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp3\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp3\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.flac\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.flac\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.flac\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.flac\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.wav\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.wav\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.wav\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.wav\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.aac\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.aac\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.aac\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.aac\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4a\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4a\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4a\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4a\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ogg\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ogg\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ogg\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.ogg\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.opus\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.opus\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.opus\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.opus\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mka\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mka\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mka\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mka\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.weba\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.weba\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.weba\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.weba\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp4\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp4\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp4\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mp4\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4v\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4v\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4v\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.m4v\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webm\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webm\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webm\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.webm\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkv\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkv\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkv\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mkv\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mov\shell\ChokottoPlayer" "" "ちょこっとPLAYERで開く"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mov\shell\ChokottoPlayer" "Icon" '"$INSTDIR\ちょこっとplayer.exe",0'
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mov\shell\ChokottoPlayer" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\.mov\shell\ChokottoPlayer\command" "" '"$INSTDIR\ちょこっとplayer.exe" "%1"'
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mp3\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.flac\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.wav\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.aac\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.m4a\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.ogg\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.opus\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mka\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.weba\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mp4\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.m4v\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.webm\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mkv\shell\ChokottoPlayer"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\.mov\shell\ChokottoPlayer"
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
