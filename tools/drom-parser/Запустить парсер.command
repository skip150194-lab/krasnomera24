#!/bin/zsh
set -e
cd "$(dirname "$0")"

clear
echo "GRZ124 — поиск красивых номеров на Drom"
echo "Регион объявлений: Красноярский край"
echo "Регионы госномеров: 24 и 124"
echo

if ! command -v python3 >/dev/null 2>&1; then
  echo "Не найден Python 3."
  echo "Установите его с https://www.python.org/downloads/macos/"
  read -k 1 "?Нажмите любую клавишу..."
  exit 1
fi

if [[ ! -d ".venv" ]]; then
  echo "Первая настройка..."
  python3 -m venv .venv
fi

source .venv/bin/activate

if [[ ! -f ".installed" ]]; then
  python -m pip install --upgrade pip
  python -m pip install -r requirements.txt
  python -m playwright install chromium
  touch .installed
fi

echo "Запускаю проверку новых объявлений..."
python drom_parser.py --pages 0

echo
echo "Результат сохранён в beautiful_numbers.csv"
read -k 1 "?Нажмите любую клавишу, чтобы закрыть окно..."
echo
