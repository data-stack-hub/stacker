import click

@click.group()
def stacker():
    """Stacker CLI for generating full-stack projects."""
    pass

@stacker.command()
@click.argument('project_name')
def init(project_name):
    print(f"Initializing project: {project_name}")