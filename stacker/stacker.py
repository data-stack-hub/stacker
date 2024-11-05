import os

class Stacker():
    def __init__(self):
        self.stacker_dir = os.getcwd()

    def init(self, project_name):
        stacker_path = os.path.join(self.stacker_dir, project_name)
        os.makedirs(stacker_path, exist_ok=True)
        FastAPIProjectGenerator(project_name, stacker_path)


class FastAPIProjectGenerator():
    def __init__(self, project_name, dir):
        self.project_name = project_name
        self.root_path = os.path.join(dir, 'backend')
        self.create_folders()
        self.create_files()

    def create_folders(self):
        os.makedirs(self.root_path, exist_ok=True)

    def create_files(self):
        self.create_file("__init__.py","")
        self.main_file()

    def create_file(self, file_path, file_content):
        file_path = os.path.join(self.root_path, file_path)
        with open(file_path, 'w') as f:
            f.write(file_content)
    
    def main_file(self):
        main_content="""
from fastapi import FastAPI

app = FastAPI()


@app.get("/ping")
def read_root():
    return {"Hello": "World"}
        """
        self.create_file( 'main.py', main_content)


