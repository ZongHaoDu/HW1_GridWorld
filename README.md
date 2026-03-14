# GridWorld Value Iteration AI Solver

An interactive Flask-based web application that demonstrates the **Value Iteration** algorithm for solving a Markov Decision Process (MDP) in a GridWorld environment.

## 🌟 Features

- **Customizable Dimensions**: Adjust grid size from $5 \times 5$ to $9 \times 9$.
- **Interactive UI**: 
  - Mouse-click to set the **Start Cell** (Green).
  - Mouse-click to set the **End Cell** (Red).
  - Mouse-click to place up to $n-2$ **Obstacles** (Gray).
- **Strategy Initialization**: Generate random initial policies and values.
- **Value Iteration**: Derive optimal value $V(s)$ and policy $\pi(s)$ via backend computation.
- **Visual Feedback**: View the Environment, Value Matrix, and Policy Matrix (Directional Arrows) in a modern Glassmorphism interface.

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- Flask

### Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd HW1_GridWorld
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the App

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **Open your browser:**
   Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🧠 Algorithm Details

The solver utilizes **Value Iteration** to find the optimal policy:

- **Discount Factor ($\gamma$):** 0.9
- **Step Penalty:** -0.04 (encourages finding the shortest path)
- **Reward:** +1.0 for reaching the Goal state.
- **Transition Model:** Deterministic (agent moves 1 step in the action direction; stays in place if hitting a wall or obstacle).

## 📄 Project Structure

- `app.py`: Flask backend and Value Iteration logic.
- `templates/`: HTML frontend.
- `static/`:
  - `css/`: Styling with glassmorphism effects.
  - `js/`: Grid interactions and UI rendering logic.
- `log.md`: Detailed activity and conversation log.

## 📝 License

This project was created for educational purposes.