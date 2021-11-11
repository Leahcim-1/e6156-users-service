import os, string, random
from flask import Flask, request, g, session, Response
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import create_engine
from dotenv import load_dotenv

tmpl_dir = os.path.join(os.path.dirname(
    os.path.abspath(__file__)),
    'templates'
)
app = Flask(__name__, template_folder=tmpl_dir)

load_dotenv('.env')

DATABASEURI = 'mysql://' + os.getenv("USERNAME") + ':' + \
    os.getenv("PASSWORD") + '@' + os.getenv("HOSTNAME") + \
    '/' + os.getenv("DATABASE_NAME")
engine = create_engine(DATABASEURI)

context = dict()

app = Flask(__name__)


@app.before_request
def before_request():
    try:
        g.conn = engine.connect()
    except Exception:
        print("uh oh, problem connecting to database")
        import traceback
        traceback.print_exc()
        g.conn = None


@app.teardown_request
def teardown_request(exception):
    try:
        g.conn.close()
    except Exception:
        pass


@app.route('/login', methods=["POST"])
def login():
    session.clear()
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        query_result = g.conn.execute(
            'SELECT * FROM users WHERE user_name=%s',
            username
        ).fetchone()
        if query_result is not None:
            if check_password_hash(query_result[4], password):
                session_signature = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(128))
                g.conn.execute(
                    'UPDATE users SET session_cookie=%s WHERE user_name=%s',
                    session_signature,
                    username
                )
                session['user'] = username
                session['signature'] = session_signature
                return Response("Authenticated", 200)
            else:
                return Response("Password Mismatch", 401)
        else:
            return Response("User Does Not Exist", 401)
    else:
        return Response("Method Not Allowed", 405)


@app.route('/signup', methods=["POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        try:
            g.conn.execute(
                'INSERT INTO users(user_name, email, password) VALUES \
                (%s, %s, %s)', username, email,
                generate_password_hash(password)
            )
            return Response("Success", 200)
        except Exception:
            return Response("Username Already Exists", 401)
    else:
        return Response("Method Not Allowed", 405)


@app.route('/logout', methods=["POST"])
def logout():
    session.clear()
    g.conn.execute(
        'UPDATE users SET session_cookie=%s WHERE user_name=%s',
        '',
        request.form.get("username")
    )
    return Response("OK", 200)


@app.route('/user-metadata', methods=["GET"])
def get_user_metadata():
    username = request.form.get("username")
    signature = request.form.get("session_cookie")
    key = request.form.get("key")
    query_result = g.conn.execute(
            'SELECT * FROM users WHERE user_name=%s AND session_cookie=%s',
            username,
            signature
        ).fetchone()
    if query_result is not None:
        try:
            value = query_result = g.conn.execute(
                'SELECT value FROM user_metadata WHERE belongs_to=%s AND key=%s',
                username,
                key
            ).fetchone()
            return value
        except Exception:
            return Response("Key Does Not Exist", 401)
    else:
        return Response("Unauthorized", 401)

if __name__ == "__main__":

    import click

    @click.command()
    @click.option('--debug', is_flag=True)
    @click.option('--threaded', is_flag=True)
    @click.argument('HOST', default='0.0.0.0')
    @click.argument('PORT', default=8080, type=int)
    def run(debug, threaded, host, port):
        HOST, PORT = host, port
        print("running on %s:%d" % (HOST, PORT))
        app.secret_key = os.getenv("SECRET_KEY")
        app.config['SESSION_TYPE'] = 'filesystem'
        app.run(host=HOST, port=PORT, debug=True, threaded=True)

    run()