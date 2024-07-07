# DataGuardSuite

DataGuardSuite is a web application designed to facilitate the backup of various types of databases, including both relational and NoSQL databases. This project is part of my ALX Africa software engineering program portfolio and was inspired by the need for a reliable and secure database backup solution for businesses. DataGuardSuite ensures that data security and reliability meet the highest standards.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [Technologies](#technologies)
- [API Routes](#api-routes)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

## Overview

DataGuardSuite enables businesses to sign up, configure their database backup settings, and select a preferred cloud storage provider. The MVP focuses on delivering essential features to ensure a solid foundation for future enhancements.

## System Architecture

DataGuardSuite's architecture is designed for efficiency and scalability. It includes:
- **User Authentication**
- **Database Configuration**
- **Backup Scheduling**
- **Backup Management**
- **User Interface**

## Core Features

1. **User Authentication**:
   - User registration and login.
   - Password recovery and account management.

2. **Database Configuration**:
   - Add and configure relational (PostgreSQL, MySQL) and NoSQL (MongoDB) databases.
   - Test database connections to ensure proper configuration.

3. **Backup Scheduling**:
   - Schedule automated backups (daily, weekly, monthly).
   - Initiate manual backups.

4. **Backup Management**:
   - View current backup status and progress.
   - Access backup history and logs.

5. **User Interface**:
   - Dashboard for backup status, recent backups, and alerts.
   - Configure databases, schedule backups, manage cloud storage.

## Technologies

DataGuardSuite leverages the following technologies:
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask)
- **Databases**: MongoDB
- **Version Control**: Git, GitHub


## API Routes

DataGuardSuite provides a robust set of API routes:

1. **User Authentication**:
   - `POST /api/register`: Register a new user.
   - `POST /api/login`: User login.
   - `POST /api/logout`: User logout.
   - `POST /api/password-recovery`: Initiate password recovery.
   - `PUT /api/password-reset`: Reset password.

2. **Database Configuration**:
   - `GET /api/datastores`: Get all configured databases.
   - `POST /api/datastores`: Add a new database.
   - `GET /api/datastores/{datastore_id}`: Get details of a specific database.
   - `PUT /api/datastores/{datastore_id}`: Update database configuration.
   - `DELETE /api/datastores/{datastore_id}`: Delete a database configuration.
   - `POST /api/datastores/{db_id}/test-connection`: Test database connection.

3. **Backup Scheduling**:
   - `GET /api/jobs`: Get all backup schedules.
   - `POST /api/jobs`: Create a new backup schedule.
   - `GET /api/jobs/{job_id}`: Get details of a specific backup schedule.
   - `PUT /api/jobs/{job_id}`: Update a backup schedule.
   - `DELETE /api/jobs/{job_id}`: Delete a backup schedule.
   - `POST /api/jobs/manual`: Initiate a manual backup.

4. **Backup Management**:
   - `GET /api/backups/status`: Get current backup status.
   - `GET /api/backups/history`: Get backup history.
   - `GET /api/backups/logs`: Get backup logs.
   - `POST /api/backups/{backup_id}/restore`: Restore database from a backup.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/worlakodzo/dataGuardsuite.git
    cd DataGuardSuite
    ```

2. Set up a virtual environment:
    ```bash
    python3 -m venv env
    source env/bin/activate
    ```

3. Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Set up environment variables (rename `env.sample` to `.env` and add your configurations):

4. Change the api base_url variable in the `client/static/js/variables.js` file to the appropriate backend server url.

5. Run the application:
    ```bash
    # Run the backend server
    python -m backend.main 
    or
    gunicorn backend.main:app -w 1 --bind 0.0.0.0:8001 --reload

    # Run the client server
    python -m client.main
    or
    gunicorn client.main:app -w 1 --bind 0.0.0.0:8000 --reload 

    you can also increase the number of workers to improve performance
    gunicorn -w 2 backend.main:app --bind 0.0.0.0:8001
    gunicorn -w 2 client.main:app --bind 0.0.0.0:8000
    ```

## Usage

1. Access the application at 
- Backend: `http://127.0.0.1:8001`
- Client: `http://127.0.0.1:8000`
2. Register a new user and log in.
3. Configure your databases and schedule backups.
4. Monitor the backup status and manage your backups through the dashboard.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.


## Acknowledgements

- [ALX Africa](https://www.alxafrica.com/)
- All contributors and collaborators who helped make this project possible.

---

DataGuardSuite is a project that was inspired by the need for a reliable and secure database backup solution for businesses. Through this project, I aimed to ensure that it meets the highest standards of data security and reliability, reflecting my dedication and hard work as part of the [ALX Africa](https://www.alxafrica.com/) software engineering program.
