# FindingsRA: EASA Audit Findings Risk Assessment Tool

[![GitHub issues](https://img.shields.io/github/issues/complianceGJL/FindingsRA)](https://github.com/complianceGJL/FindingsRA/issues)
[![GitHub forks](https://img.shields.io/github/forks/complianceGJL/FindingsRA)](https://github.com/complianceGJL/FindingsRA/network)
[![GitHub stars](https://img.shields.io/github/stars/complianceGJL/FindingsRA)](https://github.com/complianceGJL/FindingsRA/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) <!-- Assuming MIT, add LICENSE file -->

**FindingsRA** is a web-based tool designed to assist EASA (European Union Aviation Safety Agency) auditors in assessing the risk associated with audit findings. It applies the European Risk Classification Scheme (ERCS) methodology to provide a standardized approach for evaluating risks in environments such as Part CAMO, Part M, Part 145, and AIR OPS.

The primary goal of this tool is to streamline the risk assessment process for audit findings, ensuring consistency and compliance with EASA standards.

## Key Features

*   **ERCS-Based Risk Assessment:** Implements the European Risk Classification Scheme (ERCS) for systematic risk evaluation of audit findings.
*   **Interactive Finding Input:** A user-friendly interface to capture essential details of an audit finding, including its description, regulatory reference, severity, and probability.
*   **Dynamic Risk Calculation:** Automatically calculates and displays the overall risk level (e.g., Red, Amber, Green based on the ERCS matrix) based on the entered severity and probability.
*   **EASA Compliance Focus:** Specifically tailored to support auditors working within EASA regulatory frameworks.
*   **Client-Side Operation:** Runs entirely in the web browser, requiring no backend or server-side setup for its core functionality.

## Technologies Used

This project is built using standard web technologies:

*   **HTML:** For the structure and content of the application.
*   **CSS:** For styling and presentation.
*   **JavaScript:** For the application logic, including ERCS calculations and interactivity.

The language distribution in this repository is:
![Repo Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=complianceGJL&repo=FindingsRA&layout=compact&hide_border=true&theme=radical)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   A modern web browser (e.g., Chrome, Firefox, Edge, Safari).
*   Git (for cloning the repository).

### Installation & Running

1.  **Clone the repository:**
    ```
    git clone https://github.com/complianceGJL/FindingsRA.git
    ```

2.  **Navigate to the project directory:**
    The main application seems to be within the `ercs-audit-tool` folder.
    ```
    cd FindingsRA/ercs-audit-tool
    ```

3.  **Open the application:**
    Open the `index.html` file (or the main HTML file in the `ercs-audit-tool` directory) in your web browser.
    ```
    # On macOS
    open index.html

    # On Windows
    start index.html

    # On Linux
    xdg-open index.html
    ```
    Alternatively, navigate to the file using your browser's "Open File" dialog (Ctrl+O or Cmd+O).

## Usage

1.  Once the application is open in your browser, you will be presented with an interface to input audit finding details.
2.  Enter the required information for the finding, such as:
    *   Finding description or reference.
    *   The EASA regulation part it pertains to (e.g., CAMO.A.305, 145.A.30).
    *   Select the **Severity** of the finding according to the ERCS scale.
    *   Select the **Probability** of occurrence according to the ERCS scale.
3.  The tool will automatically calculate and display the risk level based on the ERCS matrix using the provided severity and probability.
4.  Use the assessed risk level to prioritize corrective actions and manage compliance.

## Contributing

Contributions are welcome! If you have suggestions for improvements or want to contribute to the development, please follow these steps:

1.  Fork the Project (`https://github.com/complianceGJL/FindingsRA/fork`).
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please ensure your code adheres to standard coding practices and that any new features are well-tested.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one is added). If no `LICENSE` file is present, please assume the code is proprietary unless otherwise stated.

## Acknowledgements

*   EASA for the European Risk Classification Scheme (ERCS) methodology.
*   Anyone whose code or inspiration was used.

---

*This README is a template and should be updated to accurately reflect the project's current state, features, and setup instructions as it evolves.*
