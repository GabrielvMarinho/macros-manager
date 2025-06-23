# Documentação do Módulo VBA para Automação SAP

Este módulo VBA fornece um conjunto de funções e sub-rotinas para interagir com o SAP GUI a partir de aplicações Microsoft Office (como Excel, Access), utilizando a automação COM do SAP GUI Scripting. Ele permite automatizar tarefas como selecionar transações, salvar arquivos, colar dados, executar ações, usar variantes, interagir com tabelas e grids, navegar em menus e manipular campos na interface do SAP.

## Variáveis Globais

*   `Public backupsession`: Usada internamente para armazenar temporariamente o objeto `session` principal quando uma função recebe um objeto `tela` (uma sessão SAP alternativa) como parâmetro, permitindo restaurar a sessão original ao final da função.
*   `Option Compare Text`: Define que as comparações de string dentro deste módulo não diferenciarão maiúsculas de minúsculas.

## Funções e Sub-rotinas Públicas


### `SAPselecionarTransacao(transacao, Optional tela = Nothing)`

*   **Descrição:** Abre uma transação específica no SAP.
*   **Parâmetros:**
    *   `transacao` (Variant/String): O código da transação a ser aberta (ex: "VA01", "ME23N").
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo para executar a ação. Se omitido, usa a `session` padrão.
*   **Notas:**
    *   Verifica mensagens de erro comuns no rodapé ("Sem autorização", "não existe") e encerra a execução (`End`) se encontradas.
    *   Detecta e preenche automaticamente um popup específico de "Perfil BD" se ele aparecer.
    *   Usa `verificarTelas` para gerenciar a sessão alvo.

---

### `SAPsalvarArquivo(nomeArquivo As String, caminho As String, Optional alternativa = 0, Optional extensao = "txt", Optional tela = Nothing)`

*   **Descrição:** Salva a visualização atual do SAP (geralmente um relatório ou tabela) em um arquivo local.
*   **Parâmetros:**
    *   `nomeArquivo` (String): O nome do arquivo a ser salvo (sem a extensão).
    *   `caminho` (String): O caminho completo da pasta onde o arquivo será salvo (ex: "C:\Temp").
    *   `alternativa` (Integer, Opcional, Padrão=0): Índice da opção de formato de salvamento (radio button) na janela de salvamento do SAP (geralmente 0 para "Não convertido", 1 para "Planilha", etc., dependendo da transação). Ignorado se `extensao` for "xls".
    *   `extensao` (String, Opcional, Padrão="txt"): A extensão do arquivo (ex: "txt", "xls", "xlsx"). Se contiver "xls", usa um caminho de menu diferente para salvar como planilha.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Notas:**
    *   Usa caminhos de menu diferentes dependendo se a extensão é "xls" ou outra.
    *   Interage com as janelas de diálogo padrão do SAP para salvar arquivos.

---

### `SAPcolarDadosCopiados(Optional ws As Worksheet, Optional coluna = 0, Optional tela = Nothing)`

*   **Descrição:** Cola dados em uma janela de seleção múltipla do SAP que já deve estar aberta (`wnd[1]`). Os dados podem vir da área de transferência ou de uma coluna específica de uma planilha Excel.
*   **Parâmetros:**
    *   `ws` (Worksheet, Opcional): A planilha do Excel de onde copiar os dados.
    *   `coluna` (Integer, Opcional, Padrão=0): O número da coluna na `ws` a ser copiada. Se `coluna` for diferente de 0 e `ws` for fornecida, copia essa coluna para a área de transferência antes de colar no SAP.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Notas:**
    *   **Importante:** Esta função assume que a janela de seleção múltipla (`wnd[1]`) já está ativa no SAP.
    *   Se `ws` e `coluna` forem fornecidos, requer uma referência à biblioteca do Excel.
    *   Simula os cliques nos botões "Importar da Área de Transferência" (ou similar, `btn[16]`), "Colar" (`btn[24]`) e "Executar" (`btn[8]`) na janela de seleção múltipla.

---

### `SAPexecutarTransacaoAtual(Optional tela = Nothing)`

*   **Descrição:** Simula o pressionamento da tecla Enter ou do botão Executar (F8) na tela atual do SAP para prosseguir com a transação.
*   **Parâmetros:**
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Boolean` - `True` se a execução parece ter prosseguido (sem mensagens de erro específicas como "Não foi selecionado" ou "não existe"), `False` caso contrário.
*   **Notas:**
    *   Tenta identificar automaticamente se o botão de execução está na `tbar[1]` (geralmente F8) ou `tbar[0]` (geralmente Enter).

---

### `SAPinserirVariante(variante, Optional tela = Nothing)`

*   **Descrição:** Seleciona e aplica uma variante de transação.
*   **Parâmetros:**
    *   `variante` (Variant/String): O nome da variante a ser aplicada.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Notas:**
    *   Lida com duas interfaces comuns de seleção de variante: a janela padrão (`wnd[1]`) e uma visualização em grid.
    *   Se a variante não for encontrada, exibe uma `MsgBox` (usando `dict_idioma`) e encerra a execução (`End`).
    *   Limpa o campo "Criado por" na janela de seleção padrão para buscar variantes de todos os usuários.

---

### `SAPvisualizarEmFormaDeLista(Optional tela = Nothing)`

*   **Descrição:** Tenta ativar o modo de visualização "Pré-visualização de Impressão" (Print Preview) em um grid ALV, que muitas vezes se assemelha a um formato de lista.
*   **Parâmetros:**
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Notas:**
    *   Depende da função privada `SAPexpadirToolbar` para encontrar o controle correto.
    *   Assume que um grid ALV está presente e ativo na tela.

---

### `SAPfiltrarLayoutNaTabela(layoutAlvo, Optional tela = Nothing)`

*   **Descrição:** Aplica um layout específico (variante de exibição) a um grid ALV.
*   **Parâmetros:**
    *   `layoutAlvo` (Variant/String): O nome do layout a ser aplicado.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Notas:**
    *   Executa uma sequência complexa de interações com menus de contexto e janelas de diálogo para encontrar e aplicar o layout.
    *   Depende da função privada `SAPexpadirToolbar`.
    *   Inclui tratamento de erro com `MsgBox` se o layout não for encontrado e encerra a execução (`End`).

---

### `SAPvoltarParaTelaInicial(Optional tela = Nothing)`

*   **Descrição:** Navega de volta para a tela inicial do SAP Easy Access (transação `SESSION_MANAGER`).
*   **Parâmetros:**
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Notas:**
    *   Verifica se já está na tela inicial antes de tentar navegar.
    *   Usa o comando `/nSESSION_MANAGER` para forçar a navegação.
    *   Lida com um possível popup (`wnd[1]`) que pode aparecer ao encerrar a transação anterior.

---

### `SAPmensagemRodape(Optional tela = Nothing)`

*   **Descrição:** Obtém a mensagem de texto exibida na barra de status (rodapé) do SAP.
*   **Parâmetros:**
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `String` - O texto completo da barra de status.
*   **Notas:** Útil para capturar mensagens de sucesso, erro ou aviso após uma ação.

---

### `SAPlimparTodosCampos(Optional tabSelecionada = 0, Optional tela = Nothing)`

*   **Descrição:** Percorre a tela ou aba atual e limpa o conteúdo de todos os campos de texto editáveis (`GuiCTextField`).
*   **Parâmetros:**
    *   `tabSelecionada` (Integer, Opcional, Padrão=0): O índice da aba a ser limpa (0 para a primeira aba).
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Notas:**
    *   Usa a função privada `percorrerTab` para navegar até a aba correta, se aplicável.
    *   Limpa apenas campos do tipo `GuiCTextField`. Outros tipos de campo (combobox, checkbox) não são afetados.

---

### `SAPprocurarColunaGrid(myGrid, colunasProcuradas As Variant, Optional tela = Nothing)`

*   **Descrição:** Verifica se um conjunto de colunas especificadas existe em um objeto Grid ALV.
*   **Parâmetros:**
    *   `myGrid` (Object): O objeto `GuiShell` representando o Grid ALV (obtido, por exemplo, com `SAPmyGrid`).
    *   `colunasProcuradas` (Variant): Um array de strings contendo os nomes técnicos das colunas a serem verificadas.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Boolean` (Implicitamente) - A função na verdade não retorna um valor booleano diretamente. Ela encerra a execução (`End`) com uma `MsgBox` (usando `dict_idioma`) se *qualquer* uma das colunas procuradas não for encontrada. Se todas forem encontradas, a execução continua normalmente.
*   **Notas:**
    *   Útil para validar se o layout esperado está carregado antes de tentar ler dados do grid.
    *   O encerramento abrupto (`End`) pode não ser ideal em todos os fluxos de automação.

---

### `SAPescolherCombo(textoProcurado, textoInserido, Optional indexAlvo = 0, Optional tela = Nothing)`

*   **Descrição:** Seleciona um item em um campo combobox (`GuiComboBox`) com base no texto visível do item.
*   **Parâmetros:**
    *   `textoProcurado` (Variant/String): O texto da etiqueta (label) associada ao combobox.
    *   `textoInserido` (Variant/String): O texto do item a ser selecionado dentro do combobox.
    *   `indexAlvo` (Integer, Opcional, Padrão=0): Usado se houver múltiplos campos com a mesma etiqueta `textoProcurado`. Indica qual ocorrência do combobox deve ser usada (0 para a primeira, 1 para a segunda, etc.).
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Boolean` - `True` se a operação foi bem-sucedida (encontrou e selecionou), `False` ou Vazio (`""`) caso contrário.
*   **Notas:**
    *   Depende da função privada `percorrerDados` com `operation = "combo"`.

---

### `SAPcapturarTexto(textoProcurado, indiceAlvo, Optional tabSelecionada = "", Optional tela = Nothing)`

*   **Descrição:** Captura o texto de um campo que está posicionado relativamente a um campo de etiqueta (label).
*   **Parâmetros:**
    *   `textoProcurado` (Variant/String): O texto da etiqueta (label) do campo de referência.
    *   `indiceAlvo` (Integer): O índice relativo do campo cujo texto deve ser capturado, contando a partir da etiqueta (ex: 1 para o campo imediatamente após a etiqueta, 2 para o segundo, etc.).
    *   `tabSelecionada` (Variant, Opcional): O índice da aba onde procurar.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Variant/String` - O texto do campo encontrado ou Vazio (`""`) se não encontrado.
*   **Notas:**
    *   Útil para ler valores de campos de saída ao lado de suas etiquetas.
    *   Depende da função privada `percorrerDados` com `operation = "capturar"`.

---

### `SAPprocurarTexto(textoProcurado, Optional tela = Nothing)`

*   **Descrição:** Verifica se um determinado texto existe em qualquer controle visível na tela ou aba atual.
*   **Parâmetros:**
    *   `textoProcurado` (Variant/String): O texto a ser procurado.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Boolean` - `True` se o texto for encontrado, `False` caso contrário.
*   **Notas:**
    *   Realiza uma busca ampla na interface.
    *   Depende da função privada `percorrerDados` com `operation = "procurar"`.

---

### `SAPescreverTexto(textoProcurado, textoInserido, Optional tabSelecionada = 0, Optional indexAlvo = 0, Optional escreverAte = False, Optional campoEscrita = 0, Optional tela = Nothing)`

*   **Descrição:** Escreve um valor de texto em um campo de entrada (`GuiCTextField`, `GuiTextField`) identificado pela sua etiqueta (label).
*   **Parâmetros:**
    *   `textoProcurado` (Variant/String): O texto da etiqueta associada ao campo de entrada.
    *   `textoInserido` (Variant/String): O texto a ser escrito no campo.
    *   `tabSelecionada` (Integer, Opcional, Padrão=0): O índice da aba onde procurar.
    *   `indexAlvo` (Integer, Opcional, Padrão=0): Usado se houver múltiplos campos com a mesma etiqueta.
    *   `escreverAte` (Boolean, Opcional, Padrão=False): Se `True`, parece tentar escrever no terceiro campo após a etiqueta (comportamento específico, talvez para intervalos "De"/"Até").
    *   `campoEscrita` (Integer, Opcional, Padrão=0): Se diferente de 0, especifica um deslocamento a partir da etiqueta para encontrar o campo de escrita (ex: 1 para o campo logo após, 2 para o segundo). Prevalece sobre `escreverAte`.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Variant/Boolean` - `True` se a escrita foi realizada, Vazio (`""`) ou `False` caso contrário.
*   **Notas:**
    *   Os parâmetros `escreverAte` e `campoEscrita` oferecem flexibilidade para cenários onde o campo de entrada não está imediatamente após a etiqueta.
    *   Depende da função privada `percorrerDados` com `operation = "escrever"`.

---

### `SAPselecaoMultipla(textoProcurado, Optional tabSelecionada = 0, Optional indexAlvo = 0, Optional tela = Nothing)`

*   **Descrição:** Pressiona o botão "Seleção múltipla" (geralmente ao lado de um campo de entrada) associado a uma etiqueta.
*   **Parâmetros:**
    *   `textoProcurado` (Variant/String): O texto da etiqueta associada ao campo que possui o botão de seleção múltipla.
    *   `tabSelecionada` (Integer, Opcional, Padrão=0): O índice da aba onde procurar.
    *   `indexAlvo` (Integer, Opcional, Padrão=0): Usado se houver múltiplos campos com a mesma etiqueta.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Variant/Boolean` - `True` se o botão foi pressionado, Vazio (`""`) ou `False` caso contrário.
*   **Notas:**
    *   Assume a estrutura comum onde o botão de seleção múltipla segue o campo de entrada associado à etiqueta.
    *   Depende da função privada `percorrerDados` com `operation = "multipla"`.

---

### `SAPflegarOpcao(textoProcurado, Optional tabSelecionada = 0, Optional indexAlvo = 0, Optional flag_alternativa = "", Optional campoEscrita = 0, Optional tela = Nothing)`

*   **Descrição:** Marca (`True`) ou desmarca (`False`) um checkbox (`GuiCheckBox`) ou seleciona um radio button (`GuiRadioButton`).
*   **Parâmetros:**
    *   `textoProcurado` (Variant/String): O texto da etiqueta associada ao checkbox ou radio button.
    *   `tabSelecionada` (Integer, Opcional, Padrão=0): O índice da aba.
    *   `indexAlvo` (Integer, Opcional, Padrão=0): Usado para múltiplas ocorrências da etiqueta.
    *   `flag_alternativa` (Variant, Opcional, Padrão=""):
        *   Para Checkboxes: Use `True` para marcar, `False` para desmarcar.
        *   Para Radio Buttons: Deixe Vazio (`""`) ou omita para simplesmente selecionar o radio button.
    *   `campoEscrita` (Integer, Opcional, Padrão=0): Se diferente de 0, especifica um deslocamento a partir da etiqueta para encontrar o controle (útil se o controle não estiver imediatamente após a etiqueta).
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Variant/Boolean` - `True` se a operação foi realizada, Vazio (`""`) ou `False` caso contrário.
*   **Notas:**
    *   Versátil para lidar com ambos os tipos de controle de seleção.
    *   Depende da função privada `percorrerDados` com `operation = "flegar"`.

---

### `SAPmyGrid(Optional tela = Nothing)`

*   **Descrição:** Procura e retorna o principal objeto Grid ALV (`GuiShell` que contém dados tabulares) na tela atual.
*   **Parâmetros:**
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Object` - O objeto `GuiShell` representando o grid ALV, ou `Nothing` se não encontrado.
*   **Notas:**
    *   Depende da função privada `percorrerMyGrid`.
    *   Assume geralmente que há um grid principal na tela.

---

### `SAPescreverGridExcel(myGrid, ws As Worksheet, lineStart, columnStart, Optional tela = Nothing)`

*   **Descrição:** Extrai todos os dados de um objeto Grid ALV e os escreve em uma planilha do Excel.
*   **Parâmetros:**
    *   `myGrid` (Object): O objeto Grid ALV (obtido com `SAPmyGrid`).
    *   `ws` (Worksheet): A planilha do Excel onde os dados serão escritos.
    *   `lineStart` (Long): A linha inicial na planilha `ws` para começar a escrever (base 1).
    *   `columnStart` (Long): A coluna inicial na planilha `ws` para começar a escrever (base 1).
    *   `tela` (Object, Opcional): *Este parâmetro parece não ser utilizado nesta função específica.*
*   **Notas:**
    *   Requer referência à biblioteca do Excel.
    *   Usa `SAPcontarLinhasTabela` para garantir que todas as linhas do grid sejam lidas.
    *   Escreve os dados na planilha na mesma ordem de colunas que aparecem no grid.
    *   Inclui a linha de cabeçalho do grid (índice -1 no loop `i`).

---

### `SAPcontarLinhasTabela(myGrid, Optional tela = Nothing)`

*   **Descrição:** Conta o número total de linhas em um Grid ALV, forçando o carregamento de todas as linhas rolando a visualização ("page down") se necessário.
*   **Parâmetros:**
    *   `myGrid` (Object): O objeto Grid ALV.
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Long` - O número total de linhas de dados no grid (excluindo cabeçalho).
*   **Notas:**
    *   Essencial para grids grandes onde nem todas as linhas são carregadas inicialmente.
    *   Usa a propriedade `firstVisibleRow` para simular a rolagem.
    *   Inclui tratamento de erro (`On Error GoTo`) para o caso de problemas durante a rolagem.

---

### `SAPinteragirTela(textoProcurado, Optional tela = Nothing)`

*   **Descrição:** Interage com um elemento da tela (botão, aba, item de menu) identificado pelo seu texto, tooltip ou caminho de menu.
*   **Parâmetros:**
    *   `textoProcurado` (Variant/String):
        *   Para botões/abas: O texto ou tooltip do controle.
        *   Para menus: Um caminho de menu delimitado por ponto e vírgula (ex: "Sistema;Status").
        *   Para itens de contexto de toolbar/grid: Texto do botão principal e, opcionalmente, texto do item de menu, separados por ";". (ex: "&MB_VARIANT;&LOAD").
    *   `tela` (Object, Opcional): Um objeto `GuiSession` alternativo.
*   **Retorna:** `Boolean` - `True` se a interação foi tentada (não garante sucesso absoluto, mas indica que um elemento correspondente foi encontrado e uma ação foi realizada), `False` caso contrário.
*   **Notas:**
    *   Função muito flexível que usa a função privada `percorrerTudo` para encontrar e interagir com o elemento.
    *   Pode pressionar botões, selecionar abas, navegar em menus e interagir com toolbars complexas (incluindo as de grids ALV e da transação CJ20N/MD04).

---

### `SAPpercorrerTabela(...)`

*   **Descrição:** Função complexa e versátil para interagir com tabelas do tipo `GuiTableControl` (geralmente tabelas mais antigas, *não* Grids ALV). Permite obter o objeto da tabela, ler/escrever valores de células, marcar/desmarcar checkboxes em células, selecionar células/linhas, encontrar linhas com base no conteúdo, etc.
*   **Parâmetros:**
    *   `objetivo` (String): A ação a ser realizada (ex: "objeto", "capturar", "selecionar", "sobrescrever", "desflegar", "flegar", "linha", "marcar_linha", "desmarcar_linha", "CountRows").
    *   `colunaProcurada` (String, Opcional): O título da coluna alvo.
    *   `linhaProcurada` (Integer, Opcional): O índice da linha alvo (base 0).
    *   `context` (String, Opcional, Padrão="txt"): Parte do ID do controle dentro da célula (geralmente "txt" para `GuiTextField`, "lbl" para `GuiLabel`, "chk" para `GuiCheckBox`).
    *   `varios` (Boolean, Opcional, Padrão=False): Se `True`, a operação se aplica a várias linhas (ex: capturar todos os valores da coluna, flegar todos os checkboxes); se `False`, aplica-se apenas à `linhaProcurada`.
    *   `escreve` (String, Opcional): Texto a ser escrito (para `objetivo="sobrescrever"`) ou procurado (para `objetivo="linha"`, `"marcar_linha"`, `"desmarcar_linha"`).
    *   `reguaColuna` (Integer, Opcional, Padrão=0): Ajuste de índice para encontrar o ID correto da coluna, se necessário.
*   **Retorna:** `Variant` - Depende do `objetivo`:
    *   `"objeto"`: Retorna o objeto `GuiTableControl`.
    *   `"capturar"` (varios=False): String com o valor da célula.
    *   `"capturar"` (varios=True): Array de Strings com os valores da coluna.
    *   `"linha"`: Long com o índice da linha encontrada.
    *   `"CountRows"`: Long com o número total de linhas.
    *   Outros objetivos: Não retorna valor explícito, mas modifica o estado da tabela.
    *   Em caso de erro: Retorna a string "Erro".
*   **Notas:**
    *   **Distinção Importante:** Esta função é para `GuiTableControl`, não para `GuiShell` (ALV Grids). Para ALV Grids, use `SAPmyGrid`, `SAPescreverGridExcel`, `SAPcontarLinhasTabela`, `SAPprocurarColunaGrid`.
    *   Muito poderosa para interagir com tabelas antigas, mas requer entendimento dos parâmetros `objetivo` e `varios`.
    *   Depende da função privada `retornarTabela`.

---

## Funções Privadas

O módulo contém várias funções `Private` que são usadas internamente pelas funções `Public`. Elas não devem ser chamadas diretamente de fora do módulo. Seus propósitos incluem:

*   `retornarTabela`: Localiza recursivamente um objeto `GuiTableControl`.
*   `percorrerMyGrid`: Localiza recursivamente um objeto `GuiShell` (ALV Grid).
*   `percorrerTudo`: Função de busca e interação genérica para botões, menus, tabs, toolbars.
*   `SAPinteragirMenu`: Lógica específica para navegar na barra de menus principal.
*   `percorrerDados`: Função de busca e interação genérica para campos dentro de containers (tabs, sub-screens), usada por `SAPescreverTexto`, `SAPflegarOpcao`, etc.
*   `SAPexpadirToolbar`: Lógica específica para expandir toolbars em grids ALV.
*   `percorrerSub`, `percorrerTab`: Funções auxiliares para navegar dentro de sub-screens e tabs.
*   `botaoEnterEncontradoTbar`: Verifica qual botão (Enter ou F8) está disponível para execução.
*   `verificarTelas`: Gerencia o uso de sessões SAP alternativas (`tela`) e restaura a original (`backupsession`).

---