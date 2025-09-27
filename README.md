# AI NEWS HEALTH CURATOR 🩺💊

A web application designed to simplify complex health news, making it accessible and understandable for everyone. This project leverages AI to summarize, simplify, and present health articles in a user-friendly daily feed.

---

## ✨ Features

* **Daily Health Feed:** Loads the latest health news from various sources into a clean, easy-to-read feed.
* **AI-Powered Summaries:** Each article is automatically condensed into:
    * A two-line **TL;DR** (Too Long; Didn't Read) for a quick overview.
    * Three bulleted **key takeaways**.
* **Simplified Content:** Select any article to read an AI-rewritten version in a simpler, more approachable tone.
* **Modern UI:** Features a smooth user experience with pagination and pull-to-refresh functionality.

---

## 🚀 Project Flow

1.  **Load Articles:** The application fetches a list of mock news articles or pulls from an RSS dump.
2.  **AI Processing:** An AI model processes each article to generate concise summaries and key points.
3.  **Display Feed:** The summarized articles are displayed in a paginated list.
4.  **Expand & Simplify:** Users can click on any article to view a version rewritten by AI for clarity and simplicity.

---

## 🛠️ Tech Stack

* **Frontend:** **React.js** + **Vite.js**
* **Styling:** **Tailwind CSS**
* **AI/ML:** **Qwen2** (Open Source Large Language Model)
* **Backend:** None (This is a frontend-only application)

---

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.




### Prerequisites

You need to have **Node.js** and **npm** installed on your machine.

* [Node.js](https://nodejs.org/en/download/) (which includes npm)

### Installation & Running

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Sailesh3000/health-news-curator](https://github.com/Sailesh3000/health-news-curator)
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd health-news-curator
    ```

3.  **Go to the frontend directory:**
    ```sh
    cd frontend
    ```

4.  **Install the dependencies:**
    ```sh
    npm install
    ```

5.  **Run the development server:**
    ```sh
    npm run dev
    ```

The application should now be running on `http://localhost:5173` (or another port specified by Vite).

---

## 🖼️ Screenshots

![A screenshot of the Health News Curator application](./frontend/assets/Screenshot%202025-09-27%20124611.png)
![A screenshot of the Health News Curator application](./frontend/assets/Screenshot%202025-09-27%20124623.png)
![A screenshot of the Health News Curator application](./frontend/assets/Screenshot%202025-09-27%20124634.png)

---
## 🧠 AI Model Citation

This project utilizes the open-source **Qwen2** model. If you use this work, please cite the original authors.

```bibtex
@misc{qwen2.5,
    title = {Qwen2.5: A Party of Foundation Models},
    url = {[https://qwenlm.github.io/blog/qwen2.5/](https://qwenlm.github.io/blog/qwen2.5/)},
    author = {Qwen Team},
    month = {September},
    year = {2024}
}

@article{qwen2,
      title={Qwen2 Technical Report}, 
      author={An Yang and Baosong Yang and Binyuan Hui and Bo Zheng and Bowen Yu and Chang Zhou and Chengpeng Li and Chengyuan Li and Dayiheng Liu and Fei Huang and Guanting Dong and Haoran Wei and Huan Lin and Jialong Tang and Jialin Wang and Jian Yang and Jianhong Tu and Jianwei Zhang and Jianxin Ma and Jin Xu and Jingren Zhou and Jinze Bai and Jinzheng He and Junyang Lin and Kai Dang and Keming Lu and Keqin Chen and Kexin Yang and Mei Li and Mingfeng Xue and Na Ni and Pei Zhang and Peng Wang and Ru Peng and Rui Men and Ruize Gao and Runji Lin and Shijie Wang and Shuai Bai and Sinan Tan and Tianhang Zhu and Tianhao Li and Tianyu Liu and Wenbin Ge and Xiaodong Deng and Xiaohuan Zhou and Xingzhang Ren and Xinyu Zhang and Xipin Wei and Xuancheng Ren and Yang Fan and Yang Yao and Yichang Zhang and Yu Wan and Yunfei Chu and Yuqiong Liu and Zeyu Cui and Zhenru Zhang and Zhihao Fan},
      journal={arXiv preprint arXiv:2407.10671},
      year={2024}
}