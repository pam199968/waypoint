import { click, visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupSession } from '../helpers/login';

module('Acceptance | workspaces', function (hooks) {
  setupApplicationTest(hooks);
  setupSession(hooks);
  setupMirage(hooks);

  test('switching workspaces', async function (assert) {
    let staging = this.server.create('workspace', { name: 'staging' });
    let production = this.server.create('workspace', { name: 'production' });
    let project = this.server.create('project', { name: 'test-project' });
    let application = this.server.create('application', { name: 'test-project', project });
    this.server.create('build', 'random', { application, workspace: staging });
    this.server.create('build', 'random', { application, workspace: production });

    await visit(`/${staging.name}/${project.name}/app/${application.name}/builds`);

    assert.dom('[data-test-workspace-switcher]').containsText('staging');
    assert.dom('[data-test-app-item-build]').containsText('v1');

    await click('[data-test-dropdown-trigger]');
    await click(`a[href="/${production.name}/${project.name}/app/${application.name}/builds"]`);

    assert.dom('[data-test-workspace-switcher]').containsText('production');
    assert.dom('[data-test-app-item-build]').containsText('v2');
  });

  test('automatically selects workspace in local storage, if valid', async function (assert) {
    let workspace = this.server.create('workspace', { name: 'production' });
    let session = this.owner.lookup('service:session');

    session.set('data.workspace', workspace.name);

    await visit('/');

    assert.equal(currentURL(), '/production');
  });

  test('automatically selects default workspace, if it exists', async function (assert) {
    this.server.create('workspace', { name: 'alpha' });
    this.server.create('workspace', { name: 'default' });

    await visit('/');

    assert.equal(currentURL(), '/default');
  });

  test('automatically selects alphabetically first workspace, if default does not exist', async function (assert) {
    this.server.create('workspace', { name: 'beta' });
    this.server.create('workspace', { name: 'alpha' });

    await visit('/');

    assert.equal(currentURL(), '/alpha');
  });

  test('automatically selects default workspace, if no concrete workspaces exist', async function (assert) {
    await visit('/');

    assert.equal(currentURL(), '/default');
  });

  test('does the right thing if workspace in local storage is invalid', async function (assert) {
    this.server.create('workspace', { name: 'alpha' });

    let session = this.owner.lookup('service:session');

    session.set('data.workspace', 'nope');

    await visit('/');

    assert.equal(currentURL(), '/alpha');
  });

  test('the last workspace is remembered', async function (assert) {
    this.server.create('workspace', { name: 'alpha' });
    this.server.create('workspace', { name: 'default' });

    await visit('/alpha');
    await visit('/');

    assert.equal(currentURL(), '/alpha');
  });
});
