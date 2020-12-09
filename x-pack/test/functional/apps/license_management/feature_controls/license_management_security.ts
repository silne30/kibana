/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getPageObjects, getService }: FtrProviderContext) {
  const esArchiver = getService('esArchiver');
  const security = getService('security');
  const PageObjects = getPageObjects(['common', 'settings', 'security']);
  const appsMenu = getService('appsMenu');
  const managementMenu = getService('managementMenu');
  const deployment = getService('deployment');

  describe('security', () => {
    before(async () => {
      await esArchiver.load('empty_kibana');
      await PageObjects.common.navigateToApp('home');
    });

    after(async () => {
      await esArchiver.unload('empty_kibana');
    });

    describe('global all privileges (aka kibana_admin)', () => {
      before(async () => {
        await security.testUser.setRoles(['kibana_admin'], true);
      });
      after(async () => {
        await security.testUser.restoreDefaults();
      });

      it('should show the Stack Management nav link', async () => {
        const links = await appsMenu.readLinks();
        expect(links.map((link) => link.text)).to.contain('Stack Management');
      });

      it('should not render the "Stack" section', async () => {
        await PageObjects.common.navigateToApp('management');
        const sections = (await managementMenu.getSections()).map((section) => section.sectionId);
        expect(sections).to.eql(['insightsAndAlerting', 'kibana']);
      });
    });

    describe('global dashboard all with license_management_user', () => {
      before(async () => {
        await security.testUser.setRoles(['global_dashboard_all', 'license_management_user'], true);
      });
      after(async () => {
        await security.testUser.restoreDefaults();
      });
      it('should show the Stack Management nav link', async () => {
        const links = await appsMenu.readLinks();
        expect(links.map((link) => link.text)).to.contain('Stack Management');
      });

      it('should render the "Stack" section with License Management', async () => {
        await PageObjects.common.navigateToApp('management');
        const sections = await managementMenu.getSections();
        expect(sections).to.have.length(3);
        if (deployment.isCloud()) {
          expect(sections[2]).to.eql({
            sectionId: 'stack',
            sectionLinks: ['upgrade_assistant'],
          });
        } else {
          expect(sections[2]).to.eql({
            sectionId: 'stack',
            sectionLinks: ['license_management', 'upgrade_assistant'],
          });
        }
      });
    });
  });
}
