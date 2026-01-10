# 簿記3級 学習支援アプリ

仕訳問題の練習・管理ができる Web アプリケーションです。

## 機能

- **問題入力**: 仕訳問題を登録（選択肢モード / 自由記入モード）
- **問題一覧**: 登録した問題の閲覧・削除
- **答え合わせ**: 正解との比較・確認
- **下書き保存**: 入力中のデータを自動保存

## 技術スタック

- [React](https://react.dev/) 18.2
- [Vite](https://vitejs.dev/) 5.0
- [Tailwind CSS](https://tailwindcss.com/) 3.3
- [Lucide React](https://lucide.dev/) - アイコン

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（http://localhost:3000）
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## ディレクトリ構成

```
src/
├── components/
│   ├── ConfirmDialog.jsx      # 確認ダイアログ
│   ├── ErrorDialog.jsx        # エラーダイアログ
│   ├── ProblemInput.jsx       # 問題入力フォーム
│   ├── ProblemList.jsx        # 問題一覧
│   └── ReviewModal/
│       ├── ReviewModalFree.jsx   # 自由記入の答え合わせ
│       └── ReviewModalGiven.jsx  # 選択肢の答え合わせ
├── data/
│   ├── accounts.js            # 勘定科目データ
│   ├── constants.js           # 定数定義
│   └── glossary.js            # 用語集（拡張用）
├── hooks/
│   └── useStorage.js          # localStorage フック
├── App.jsx                    # メインコンポーネント
├── App.css                    # 基本スタイル
├── index.css                  # Tailwind インポート
└── main.jsx                   # エントリーポイント
```

## 勘定科目

以下のカテゴリの勘定科目に対応しています：

| カテゴリ | 科目例 |
|---------|--------|
| 資産 | 現金、普通預金、売掛金、商品、建物、備品 |
| 負債 | 支払手形、買掛金、借入金、未払金 |
| 純資産 | 資本金、引出金 |
| 収益 | 売上、受取利息、受取手数料 |
| 費用 | 仕入、給料、水道光熱費、通信費 |

## データ保存

- データは `localStorage` に保存されます
- ブラウザのデータをクリアすると問題も削除されます

## ライセンス

MIT
