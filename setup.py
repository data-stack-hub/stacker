from setuptools import setup, find_packages

setup(
    name="stacker",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "click",  # For CLI functionality
        "fastapi",  # For backend generation
        "uvicorn",  # ASGI server for FastAPI
    ],
    entry_points={
        'console_scripts': [
            'stacker=stacker.cli:stacker',  # Defines the CLI command
        ],
    },
    include_package_data=True,
    package_data={
        '': ['README.md', 'LICENSE', 'MANIFEST.in'],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)
