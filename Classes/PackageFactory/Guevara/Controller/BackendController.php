<?php
namespace PackageFactory\Guevara\Controller;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "PackageFactory.Guevara".*
 *                                                                        *
 *                                                                        */

use TYPO3\Flow\Annotations as Flow;
use TYPO3\Flow\Mvc\Controller\ActionController;
use TYPO3\Flow\Session\SessionInterface;
use TYPO3\Flow\Resource\ResourceManager;
use TYPO3\TYPO3CR\Domain\Model\NodeInterface;
use TYPO3\TYPO3CR\Domain\Service\ContextFactoryInterface;
use TYPO3\Neos\Domain\Repository\DomainRepository;
use TYPO3\Neos\Domain\Repository\SiteRepository;
use TYPO3\Neos\Domain\Service\ContentContext;
use TYPO3\Neos\Service\UserService;
use TYPO3\Neos\Service\NodeTypeSchemaBuilder;
use TYPO3\Flow\Persistence\PersistenceManagerInterface;
use TYPO3\Neos\Service\XliffService;
use TYPO3\Flow\I18n\Locale;
use TYPO3\TypoScript\Core\Cache\ContentCache;
use TYPO3\TypoScript\View\TypoScriptView;
use TYPO3\Flow\Mvc\View\ViewInterface;

class BackendController extends ActionController
{

    /**
     * @var string
     */
    protected $defaultViewObjectName = 'PackageFactory\Guevara\View\BackendTypoScriptView';

    /**
     * @var TypoScriptView
     */
    protected $view;

    /**
     * @Flow\Inject
     * @var UserService
     */
    protected $userService;

    /**
     * @Flow\Inject
     * @var ContextFactoryInterface
     */
    protected $contextFactory;

    /**
     * @Flow\Inject
     * @var DomainRepository
     */
    protected $domainRepository;

    /**
     * @Flow\Inject
     * @var SiteRepository
     */
    protected $siteRepository;

    /**
     * @Flow\Inject
     * @var PersistenceManagerInterface
     */
    protected $persistenceManager;

    /**
     * @Flow\Inject
     * @var XliffService
     */
    protected $xliffService;


    /**
     * @Flow\Inject
     * @var SessionInterface
     */
    protected $session;

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @Flow\Inject
     * @var ContentCache
     */
    protected $contentCache;

    /**
     * @Flow\InjectConfiguration(path="asyncModuleMapping")
     * @var array
     */
    protected $asyncModuleMapping;

    /**
     * @Flow\InjectConfiguration(path="legacyModuleMapping")
     * @var array
     */
    protected $legacyModuleMapping;

    public function initializeView(ViewInterface $view)
    {
        $view->setTypoScriptPath('backend');
    }

    /**
     * Displays the backend interface
     *
     * @param NodeInterface $node The node that will be displayed on the first tab
     * @return void
     */
    public function indexAction(NodeInterface $node = null)
    {

        $this->contentCache->flush();
        $this->session->start();
        $this->session->putData('__cheEnabled__', true);

        if ($user = $this->userService->getBackendUser()) {
            $workspaceName = $this->userService->getPersonalWorkspaceName();
            $contentContext = $this->createContext($workspaceName);

            $contentContext->getWorkspace();
            $this->persistenceManager->persistAll();

            $siteNode = $contentContext->getCurrentSiteNode();

            if ($node === null) {
                $node = $siteNode;
            }

            $this->view->assign('user', $user);
            $this->view->assign('documentNode', $node);
            $this->view->assign('site', $node);
            $this->view->assign('asyncModuleMapping', $this->transformAsyncModuleMapping());
            $this->view->assign('legacyModuleMapping', $this->transformLegacyModuleMapping());

            $this->view->assign('translations', $this->xliffService->getCachedJson(
                new Locale($this->userService->getInterfaceLanguage())
            ));
            return;
        }

        $this->redirectToUri($this->uriBuilder->uriFor('index', array(), 'Login', 'TYPO3.Neos'));
    }

    /**
     * Create a ContentContext to be used for the backend redirects.
     *
     * @param string $workspaceName
     * @return ContentContext
     */
    protected function createContext($workspaceName)
    {
        $contextProperties = array(
            'workspaceName' => $workspaceName,
            'invisibleContentShown' => true,
            'inaccessibleContentShown' => true
        );

        $currentDomain = $this->domainRepository->findOneByActiveRequest();

        if ($currentDomain !== null) {
            $contextProperties['currentSite'] = $currentDomain->getSite();
            $contextProperties['currentDomain'] = $currentDomain;
        } else {
            $contextProperties['currentSite'] = $this->siteRepository->findFirstOnline();
        }

        return $this->contextFactory->create($contextProperties);
    }

    /**
     * Creates a key-value list of JS modules and their sources files
     * out of the given configuration
     *
     * @return array
     */
    protected function transformAsyncModuleMapping()
    {
        $finalMapping = [];

        foreach ($this->asyncModuleMapping as $path => $modules) {
            if (preg_match('#resource://([^/]+)/Public/(.*)#', $path, $matches) === 1) {
                $packageKey = $matches[1];
                $path = $matches[2];
                $realPath = $this->resourceManager->getPublicPackageResourceUri($packageKey, $path);

                foreach ($modules as $module => $activated) {
                    if ($activated) {
                        $finalMapping[$module] = $realPath;
                    }
                }

                continue;
            }

            throw new \Exception(
                sprintf(
                    '"%s" is not a valid path to a public JavaScript. '.
                    'Please provide a resource path ("resource://...")',
                    $path
                ),
                1462703658
            );
        }

        return $finalMapping;
    }

    /**
     * Creates a key-value list of JS modules and their sources files
     * out of the given configuration
     *
     * @return array
     */
    protected function transformLegacyModuleMapping()
    {
        $finalMapping = [];

        foreach ($this->legacyModuleMapping as $path => $modules) {
            if (preg_match('#resource://([^/]+)/Public/(.*)#', $path, $matches) === 1) {
                $packageKey = $matches[1];
                $path = $matches[2];
                $realPath = $this->resourceManager->getPublicPackageResourceUri($packageKey, $path);

                foreach ($modules as $module => $migratesTo) {
                    $finalMapping[$module] = [
                        'target' => $realPath,
                        'migratesTo' => $migratesTo
                    ];
                }

                continue;
            }

            throw new \Exception(
                sprintf(
                    '"%s" is not a valid path to a public JavaScript. '.
                    'Please provide a resource path ("resource://...")',
                    $path
                ),
                1463923183
            );
        }

        return $finalMapping;
    }
}
